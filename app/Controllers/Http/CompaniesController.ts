import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from 'App/Models/Company'

const FIELDS = ['name', 'business', 'tel', 'email', 'collabs'] as const

export default class CompaniesController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only([...FIELDS])
    if (!body.name) {
      return response.badRequest({ message: 'El nombre es obligatorio' })
    }
    const company = await Company.create(body)
    return response.created(company)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Company.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const company = await Company.find(params.id)
    if (!company) {
      return response.notFound({ message: 'Empresa no encontrada' })
    }
    return company
  }

  public async update({ params, request, response }: HttpContextContract) {
    const company = await Company.find(params.id)
    if (!company) {
      return response.notFound({ message: 'Empresa no encontrada' })
    }
    const body = request.only([...FIELDS])
    company.merge(body)
    await company.save()
    return company
  }

  public async destroy({ params, response }: HttpContextContract) {
    const company = await Company.find(params.id)
    if (!company) {
      return response.notFound({ message: 'Empresa no encontrada' })
    }
    await company.delete()
    return response.noContent()
  }
}
