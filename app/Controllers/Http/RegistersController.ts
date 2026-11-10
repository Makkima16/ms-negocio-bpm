import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Register from 'App/Models/Register'
import Exam from 'App/Models/Exam'
import Question from 'App/Models/Question'
import AuthService from 'App/Services/AuthService'
import ApprovalService from 'App/Services/ApprovalService'

export default class RegistersController {
  /**
   * Grades an exam attempt on the server. The client only sends the answers:
   * `aprobacion`, question texts and the correct answers are never trusted.
   */
  public async store({ request, response }: HttpContextContract) {
    const body = request.only(['examen_id', 'client_id', 'answer1', 'answer2', 'answer3'])

    const examId = Number(body.examen_id)
    if (!Number.isFinite(examId)) {
      return response.badRequest({ message: 'examen_id es obligatorio' })
    }

    const clientId = await AuthService.resolveClientId(
      request,
      body.client_id ? Number(body.client_id) : null
    )
    if (!clientId) {
      return response.forbidden({ message: 'No se pudo identificar el cliente' })
    }

    const exam = await Exam.find(examId)
    if (!exam) {
      return response.notFound({ message: 'Examen no encontrado' })
    }

    if (!AuthService.isAdmin(request)) {
      const hasPaid = await ApprovalService.hasAcceptedPayment(clientId)
      if (!hasPaid) {
        return response.status(402).send({
          message: 'Debe realizar el pago del curso antes de presentar el examen',
        })
      }
    }

    const alreadyApproved = await Register.query()
      .where('client_id', clientId)
      .where('examen_id', examId)
      .where('aprobacion', true)
      .first()
    if (alreadyApproved) {
      return response.ok({
        message: 'Este examen ya fue aprobado',
        ...alreadyApproved.toJSON(),
        aprobacion: true,
      })
    }

    const questions = await Question.query()
      .where('module_id', examId)
      .orderBy('id', 'asc')
      .limit(3)

    if (questions.length === 0) {
      return response.conflict({ message: 'El examen no tiene preguntas registradas' })
    }

    const answers = [body.answer1, body.answer2, body.answer3].map((answer) =>
      typeof answer === 'string' ? answer.trim() : ''
    )

    let correctAnswers = 0
    questions.forEach((question, index) => {
      if (answers[index] && answers[index] === question.correct_choice) {
        correctAnswers++
      }
    })

    const aprobacion = correctAnswers === questions.length

    const register = await Register.create({
      examen_id: examId,
      client_id: clientId,
      question1: questions[0]?.text ?? '',
      question2: questions[1]?.text ?? '',
      question3: questions[2]?.text ?? '',
      answer1: answers[0],
      answer2: answers[1],
      answer3: answers[2],
      aprobacion,
    })

    return response.created({
      ...register.toJSON(),
      correctAnswers,
      totalQuestions: questions.length,
      aprobacion,
    })
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Register.query().orderBy('created_at', 'desc').paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const register = await Register.find(params.id)
    if (!register) {
      return response.notFound({ message: 'Registro no encontrado' })
    }
    return register
  }

  public async destroy({ params, response }: HttpContextContract) {
    const register = await Register.find(params.id)
    if (!register) {
      return response.notFound({ message: 'Registro no encontrado' })
    }
    await register.delete()
    return response.noContent()
  }
}
