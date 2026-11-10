import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Exam from 'App/Models/Exam'
import Modulo from 'App/Models/Modulo'
import Question from 'App/Models/Question'
import AuthService from 'App/Services/AuthService'
import ApprovalService from 'App/Services/ApprovalService'

export default class ExamsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only(['title', 'information', 'module_id'])
    if (!body.title || !body.information || !body.module_id) {
      return response.badRequest({
        message: 'title, information y module_id son obligatorios',
      })
    }

    const modulo = await Modulo.find(Number(body.module_id))
    if (!modulo) {
      return response.badRequest({ message: 'El módulo indicado no existe' })
    }

    const theExam = await Exam.create({
      title: body.title,
      information: body.information,
      module_id: Number(body.module_id),
    })
    return response.created(theExam)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 50)), 100)
    return Exam.query()
      .select('id', 'title', 'information', 'module_id')
      .paginate(page, perPage)
  }

  public async findAll() {
    return Exam.all()
  }

  public async show({ params, response }: HttpContextContract) {
    const exam = await Exam.find(params.id)
    if (!exam) {
      return response.notFound({ message: 'Examen no encontrado' })
    }
    return exam
  }

  public async update({ params, request, response }: HttpContextContract) {
    const body = request.only(['title', 'information'])
    const exam = await Exam.find(params.id)
    if (!exam) {
      return response.notFound({ message: 'Examen no encontrado' })
    }
    if (!body.title || !body.information) {
      return response.badRequest({ message: 'title e information son obligatorios' })
    }
    exam.merge({ title: body.title, information: body.information })
    await exam.save()
    return exam
  }

  public async destroy({ params, response }: HttpContextContract) {
    const exam = await Exam.find(params.id)
    if (!exam) {
      return response.notFound({ message: 'Examen no encontrado' })
    }
    await exam.delete()
    return response.noContent()
  }

  /**
   * Tells whether the client already passed the module. The client can only
   * query its own progress unless it is an administrator.
   */
  public async checkModuleApproval({ request, response }: HttpContextContract) {
    const clientId = Number(request.input('client_id'))
    const moduleId = Number(request.input('module_id'))

    if (!Number.isFinite(clientId) || !Number.isFinite(moduleId)) {
      return response.badRequest({ message: 'client_id y module_id son obligatorios' })
    }
    if (!(await AuthService.canAccessClient(request, clientId))) {
      return response.forbidden({ message: 'No puede consultar otro cliente' })
    }

    const hasPassed = await ApprovalService.clientPassedModule(clientId, moduleId)
    return response.ok({ client_id: clientId, module_id: moduleId, has_passed: hasPassed })
  }

  /**
   * Questions for an exam. Administrators receive the full payload (including
   * the correct answer) to edit it; clients receive shuffled choices only.
   */
  public async getQuestionsByModule({ params, request, response }: HttpContextContract) {
    const examId = Number(params.module_id)
    if (!Number.isFinite(examId)) {
      return response.badRequest({ message: 'module_id inválido' })
    }

    const questions = await Question.query()
      .where('module_id', examId)
      .orderBy('id', 'asc')

    if (AuthService.isAdmin(request)) {
      return questions
    }

    return questions.map((question) => ({
      id: question.id,
      text: question.text,
      choices: this.shuffle(
        [question.choice_one, question.choice_two, question.choice_three, question.correct_choice]
          .filter((choice): choice is string => typeof choice === 'string' && choice.length > 0)
      ),
    }))
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }
}
