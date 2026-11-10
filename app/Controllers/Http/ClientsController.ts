import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import AuthService from 'App/Services/AuthService'

const EDITABLE_FIELDS = ['name', 'apellido', 'email', 'user_id', 'tel', 'cedula'] as const

export default class ClientsController {
  /**
   * Public registration: called right after the user is created in ms-security.
   */
  public async store({ request, response }: HttpContextContract) {
    const body = request.only([...EDITABLE_FIELDS])

    if (!body.name || !body.email || !body.user_id) {
      return response.badRequest({
        message: 'name, email y user_id son obligatorios',
      })
    }

    const existingEmail = await Client.findBy('email', body.email)
    if (existingEmail) {
      return response.conflict({ message: 'Ya existe un cliente con ese correo' })
    }

    const existingUser = await Client.findBy('user_id', body.user_id)
    if (existingUser) {
      return response.conflict({ message: 'Ya existe un cliente para ese usuario' })
    }

    const client = await Client.create(body)
    return response.created(client)
  }

  /** Returns the client profile linked to the authenticated user. */
  public async me({ request, response }: HttpContextContract) {
    return this.ownClient(request, response)
  }

  private async ownClient(
    request: HttpContextContract['request'],
    response: HttpContextContract['response']
  ) {
    const client = await AuthService.getCurrentClient(request)
    if (!client) {
      return response.notFound({ message: 'No se encontró el perfil del cliente' })
    }
    return client
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Client.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const client = await Client.find(params.id)
    if (!client) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }
    return client
  }

  public async update({ params, request, response }: HttpContextContract) {
    const client = await Client.find(params.id)
    if (!client) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }

    const body = request.only([...EDITABLE_FIELDS])
    if (body.email) {
      const owner = await Client.findBy('email', body.email)
      if (owner && owner.id !== client.id) {
        return response.conflict({ message: 'Ese correo ya está en uso' })
      }
    }
    client.merge(body)
    await client.save()
    return client
  }

  public async destroy({ params, response }: HttpContextContract) {
    const client = await Client.find(params.id)
    if (!client) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }
    await client.delete()
    return response.noContent()
  }

  public async hasAcceptedPayments({ params, request, response }: HttpContextContract) {
    return this.paymentStatus(params.id, request, response, ['Aceptada'])
  }

  public async hasExistPayments({ params, request, response }: HttpContextContract) {
    return this.paymentStatus(params.id, request, response, ['Aceptada', 'Pendiente'])
  }

  private async paymentStatus(
    clientId: string,
    request: HttpContextContract['request'],
    response: HttpContextContract['response'],
    states: string[]
  ) {
    const client = await Client.find(clientId)
    if (!client) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }
    if (!(await AuthService.canAccessClient(request, client.id))) {
      return response.forbidden({ message: 'No puede consultar otro cliente' })
    }

    const payments = await client
      .related('payment')
      .query()
      .whereIn('state', states)

    return response.ok({ hasAccepted: payments.length > 0 })
  }

  /** Legacy endpoint kept for compatibility; always scoped to the token owner. */
  public async buscar_UserID({ request, response }: HttpContextContract) {
    if (AuthService.isAdmin(request)) {
      const userId = request.qs().user_id
      return Client.findBy('user_id', userId)
    }
    return this.ownClient(request, response)
  }

  /** Legacy endpoint kept for compatibility; always scoped to the token owner. */
  public async buscar_Email({ request, response }: HttpContextContract) {
    if (AuthService.isAdmin(request)) {
      const email = request.qs().email
      return Client.findBy('email', email)
    }
    return this.ownClient(request, response)
  }
}
