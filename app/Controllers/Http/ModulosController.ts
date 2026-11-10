import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Modulo from 'App/Models/Modulo'
import Exam from 'App/Models/Exam'

const FIELDS = [
  'link',
  'titulo',
  'introduccion',
  'informacion',
  'conclusion',
  'imagen_url',
  'pdf_name',
  'curso_tipo',
] as const

export default class ModulosController {
  public async store({ request, response }: HttpContextContract) {
    // request.all() also exposes multipart/form-data fields.
    const body = request.all()

    if (!body.titulo || !body.introduccion || !body.informacion) {
      return response.badRequest({
        message: 'titulo, introduccion e informacion son obligatorios',
      })
    }

    const modulo = await Modulo.create({
      titulo: body.titulo,
      introduccion: body.introduccion,
      informacion: body.informacion,
      conclusion: body.conclusion ?? '',
      link: body.link ?? '',
      imagen_url: body.imagen_url ?? '',
      pdf_name: body.pdf_name ?? '',
      curso_tipo: body.curso_tipo ?? '',
    })
    return response.created(modulo)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 50)), 100)
    return Modulo.query().orderBy('id', 'asc').paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const modulo = await Modulo.find(params.id)
    if (!modulo) {
      return response.notFound({ message: 'Módulo no encontrado' })
    }
    return modulo
  }

  public async update({ params, request, response }: HttpContextContract) {
    const modulo = await Modulo.find(params.id)
    if (!modulo) {
      return response.notFound({ message: 'Módulo no encontrado' })
    }

    const body = request.only([...FIELDS])
    if (body.titulo !== undefined && !body.titulo) {
      return response.badRequest({ message: 'El título no puede estar vacío' })
    }

    modulo.merge(body)
    await modulo.save()
    return modulo
  }

  public async destroy({ params, response }: HttpContextContract) {
    const modulo = await Modulo.find(params.id)
    if (!modulo) {
      return response.notFound({ message: 'Módulo no encontrado' })
    }
    await modulo.delete()
    return response.noContent()
  }

  public async getExamsByModule({ params, response }: HttpContextContract) {
    const moduleId = Number(params.module_id)
    if (!Number.isFinite(moduleId)) {
      return response.badRequest({ message: 'module_id inválido' })
    }
    return Exam.query().where('module_id', moduleId).orderBy('id', 'asc')
  }

  public async listByCursoTipo({ params, response }: HttpContextContract) {
    const tipo = params.curso_tipo
    if (!tipo) {
      return response.badRequest({ message: 'curso_tipo es obligatorio' })
    }
    return Modulo.query().where('curso_tipo', tipo).orderBy('id', 'asc')
  }
}
