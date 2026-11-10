import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Aprobado from 'App/Models/Aprobado'
import Client from 'App/Models/Client'
import AuthService from 'App/Services/AuthService'
import ApprovalService from 'App/Services/ApprovalService'
import axios from 'axios'

const CERTIFICATE_ENDPOINTS: Record<string, string> = {
  empaquetadores: '/certificados/send-email-empaquetadores',
  carnicos: '/certificados/send-email-carnicos',
  ambulante: '/certificados/send-email',
}

export default class AprobadosController {
  /**
   * Issues a certificate only when the server verifies that the client passed
   * every module of the requested course type.
   */
  public async store({ request, response }: HttpContextContract) {
    const body = request.only(['client_id', 'type'])

    // Course types arrive with different casing ("Ambulante", "ambulante", ...).
    const type = typeof body.type === 'string' ? body.type.trim().toLowerCase() : ''
    if (!CERTIFICATE_ENDPOINTS[type]) {
      return response.badRequest({ message: 'Tipo de curso no válido' })
    }

    const clientId = await AuthService.resolveClientId(
      request,
      body.client_id ? Number(body.client_id) : null
    )
    if (!clientId) {
      return response.forbidden({ message: 'No se pudo identificar el cliente' })
    }

    const client = await Client.find(clientId)
    if (!client) {
      return response.notFound({ message: 'Cliente no encontrado' })
    }

    const { completed } = await ApprovalService.clientCompletedCourseType(clientId, type)
    if (!completed) {
      return response.badRequest({
        message: 'El cliente todavía no ha aprobado todos los módulos de este curso',
      })
    }

    let aprobado = await Aprobado.query()
      .where('client_id', clientId)
      .where('type', type)
      .first()

    if (!aprobado) {
      aprobado = await Aprobado.create({ client_id: clientId, type, correo: false })
    } else if (aprobado.correo) {
      return response.ok({ message: 'El certificado ya fue enviado', aprobado })
    }

    const emailSent = await this.sendCertificate(client, type)
    if (emailSent) {
      aprobado.correo = true
      await aprobado.save()
    }

    return response.created({
      ...aprobado.toJSON(),
      emailSent,
      message: emailSent
        ? 'Certificado generado y enviado'
        : 'Certificado registrado, pero el envío del correo falló',
    })
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Aprobado.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const aprobado = await Aprobado.find(params.id)
    if (!aprobado) {
      return response.notFound({ message: 'Aprobado no encontrado' })
    }
    return aprobado
  }

  public async update({ params, request, response }: HttpContextContract) {
    const aprobado = await Aprobado.find(params.id)
    if (!aprobado) {
      return response.notFound({ message: 'Aprobado no encontrado' })
    }
    const body = request.only(['correo'])
    if (typeof body.correo === 'boolean') {
      aprobado.correo = body.correo
    }
    await aprobado.save()
    return aprobado
  }

  public async destroy({ params, response }: HttpContextContract) {
    const aprobado = await Aprobado.find(params.id)
    if (!aprobado) {
      return response.notFound({ message: 'Aprobado no encontrado' })
    }
    await aprobado.delete()
    return response.noContent()
  }

  public async getAprobadoByClientId({ params, request, response }: HttpContextContract) {
    const clientId = Number(params.client_id)
    if (!Number.isFinite(clientId)) {
      return response.badRequest({ message: 'client_id es obligatorio' })
    }
    if (!(await AuthService.canAccessClient(request, clientId))) {
      return response.forbidden({ message: 'No puede consultar otro cliente' })
    }
    return Aprobado.query().where('client_id', clientId).orderBy('id', 'desc').first()
  }

  private async sendCertificate(client: Client, type: string): Promise<boolean> {
    const baseUrl = Env.get('MS_CORREOS', '').replace(/\/$/, '')
    if (!baseUrl) return false

    try {
      await axios.post(
        `${baseUrl}${CERTIFICATE_ENDPOINTS[type]}`,
        {
          email: client.email,
          name: `${client.name} ${client.apellido ?? ''}`.trim(),
          cedula: client.cedula,
          code: String(client.id),
        },
        { timeout: 10000 }
      )
      return true
    } catch (error: any) {
      console.error('Error enviando el certificado:', error.message)
      return false
    }
  }
}
