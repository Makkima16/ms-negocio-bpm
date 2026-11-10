import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Question from 'App/Models/Question'
import Exam from 'App/Models/Exam'

const FIELDS = ['module_id', 'text', 'correct_choice', 'choice_one', 'choice_two', 'choice_three'] as const

export default class QuestionsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only([...FIELDS])
    const error = await this.validate(body)
    if (error) return response.badRequest({ message: error })

    const question = await Question.create({
      module_id: Number(body.module_id),
      text: body.text,
      correct_choice: body.correct_choice,
      choice_one: body.choice_one,
      choice_two: body.choice_two,
      choice_three: body.choice_three,
    })
    return response.created(question)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    const moduleId = Number(request.input('module_id'))
    const query = Question.query()
    if (Number.isFinite(moduleId)) {
      query.where('module_id', moduleId)
    }
    return query.paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const question = await Question.find(params.id)
    if (!question) {
      return response.notFound({ message: 'Pregunta no encontrada' })
    }
    return question
  }

  public async update({ params, request, response }: HttpContextContract) {
    const question = await Question.find(params.id)
    if (!question) {
      return response.notFound({ message: 'Pregunta no encontrada' })
    }

    const body = request.only([...FIELDS])
    const error = await this.validate({ ...question.toJSON(), ...body })
    if (error) return response.badRequest({ message: error })

    question.merge({
      module_id: Number(body.module_id ?? question.module_id),
      text: body.text ?? question.text,
      correct_choice: body.correct_choice ?? question.correct_choice,
      choice_one: body.choice_one ?? question.choice_one,
      choice_two: body.choice_two ?? question.choice_two,
      choice_three: body.choice_three ?? question.choice_three,
    })
    await question.save()
    return question
  }

  public async destroy({ params, response }: HttpContextContract) {
    const question = await Question.find(params.id)
    if (!question) {
      return response.notFound({ message: 'Pregunta no encontrada' })
    }
    await question.delete()
    return response.noContent()
  }

  private async validate(body: Record<string, unknown>): Promise<string | null> {
    if (!body.text || !body.module_id) {
      return 'text y module_id son obligatorios'
    }
    const choices = [body.choice_one, body.choice_two, body.choice_three]
    if (choices.some((choice) => typeof choice !== 'string' || choice.length === 0)) {
      return 'Las tres opciones son obligatorias'
    }
    if (!choices.includes(body.correct_choice)) {
      return 'La respuesta correcta debe ser una de las opciones'
    }
    const exam = await Exam.find(Number(body.module_id))
    if (!exam) {
      return 'El examen indicado no existe'
    }
    return null
  }
}
