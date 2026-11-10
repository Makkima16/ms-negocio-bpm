import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Administrator from 'App/Models/Administrator'

const FIELDS = ['name', 'email', 'user_id', 'tel', 'cedula'] as const

export default class AdministratorsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only([...FIELDS])
    if (!body.name || !body.email || !body.user_id) {
      return response.badRequest({ message: 'name, email y user_id son obligatorios' })
    }
    const existing = await Administrator.findBy('email', body.email)
    if (existing) {
      return response.conflict({ message: 'Ya existe un administrador con ese correo' })
    }
    const administrator = await Administrator.create(body)
    return response.created(administrator)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Administrator.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const administrator = await Administrator.find(params.id)
    if (!administrator) {
      return response.notFound({ message: 'Administrador no encontrado' })
    }
    return administrator
  }

  public async destroy({ params, response }: HttpContextContract) {
    const administrator = await Administrator.find(params.id)
    if (!administrator) {
      return response.notFound({ message: 'Administrador no encontrado' })
    }
    await administrator.delete()
    return response.noContent()
  }
}
