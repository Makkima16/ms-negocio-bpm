import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Exam from 'App/Models/Exam'

export default class ExamsController {
  public async store({ request }: HttpContextContract) {
    let body = request.body()
    const theExam = await Exam.create(body)
    return theExam
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1);
    const perPage = request.input('per_page', 50);
    let exams = await Exam.query().select('id', 'titulo', 'informacion', 'module_id').paginate(page, perPage);
    return exams;
  }


  public async show({ params }: HttpContextContract) {
    return Exam.findOrFail(params.id)
  }

  /**
   * Método para verificar si un cliente aprobó un examen específico
/**
 * Verificar si un cliente aprobó al menos un examen de un módulo
 */
public async checkModuleApproval({ request, response }: HttpContextContract) {
  const { client_id, module_id } = request.only(['client_id', 'module_id'])

  // Validar entrada
  if (!client_id || !module_id) {
    return response.badRequest({ error: 'client_id y module_id son requeridos' })
  }

  try {
    // Buscar exámenes asociados al módulo
    const exams = await Database.from('exams').where('module_id', module_id).select('id')

    // Si no hay exámenes, retornar falso
    if (exams.length === 0) {
      return response.ok({ client_id, module_id, has_passed: false })
    }

    // Verificar si hay al menos un registro aprobado en la tabla `registers`
    const hasPassed = await Database.from('registers')
      .where('client_id', client_id)
      .whereIn('examen_id', exams.map((exam) => exam.id))
      .andWhere('aprobacion', true)
      .first()

    // Retornar si el cliente aprobó al menos un examen
    return response.ok({ client_id, module_id, has_passed: !!hasPassed })
  } catch (error) {
    return response.internalServerError({
      error: 'Error verificando la aprobación',
      details: error.message,
    })
  }
}

  public async update({params, request}: HttpContextContract){
    const body = request.body();
    const theExam: Exam = await Exam.findOrFail(params.id);
    theExam.title = body.title;
    theExam.information = body.information;
    return theExam.save();
}


public async destroy({params, response}: HttpContextContract){
  const theExam: Exam = await Exam.findOrFail(params.id);
  response.status(204);
  return theExam.delete()
}

public async getQuestionsByModule({ params, response }) {
  const moduleId = params.module_id;
  const questions = await Database
    .from('questions')
    .where('module_id', moduleId)
    .select('*');
  return response.json(questions);
}  
}
