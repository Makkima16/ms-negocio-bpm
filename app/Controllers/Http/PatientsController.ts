import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import Alarm from 'App/Models/Alarm'
import AuthService from 'App/Services/AuthService'

export default class PatientsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only([
      'alarma_id',
      'name',
      'age',
      'cedula',
      'tetanos',
      'hepatitis_a',
      'hepatitis_b',
      'tetanos_description',
      'hepatitis_a_description',
      'hepatitis_b_description',
    ])

    const alarm = await Alarm.find(Number(body.alarma_id))
    if (!alarm) {
      return response.badRequest({ message: 'El recordatorio indicado no existe' })
    }
    if (!(await AuthService.canAccessClient(request, alarm.client_id))) {
      return response.forbidden({ message: 'No puede registrar pacientes en otro recordatorio' })
    }
    if (!body.name || !body.cedula || !body.age) {
      return response.badRequest({ message: 'name, cedula y age son obligatorios' })
    }

    const patient = await Patient.create(body)
    return response.created(patient)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Patient.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const patient = await Patient.find(params.id)
    if (!patient) {
      return response.notFound({ message: 'Paciente no encontrado' })
    }
    return patient
  }

  public async update({ params, request, response }: HttpContextContract) {
    const patient = await Patient.find(params.id)
    if (!patient) {
      return response.notFound({ message: 'Paciente no encontrado' })
    }

    const alarm = await Alarm.find(patient.alarma_id)
    if (!alarm || !(await AuthService.canAccessClient(request, alarm.client_id))) {
      return response.forbidden({ message: 'No puede modificar este paciente' })
    }

    const body = request.only([
      'name',
      'age',
      'cedula',
      'tetanos',
      'hepatitis_a',
      'hepatitis_b',
      'tetanos_description',
      'hepatitis_a_description',
      'hepatitis_b_description',
    ])
    patient.merge(body)
    await patient.save()
    return patient
  }

  public async byAlarmId({ params, request, response }: HttpContextContract) {
    const alarm = await Alarm.find(params.alarma_id)
    if (!alarm) {
      return response.notFound({ message: 'Recordatorio no encontrado' })
    }
    if (!(await AuthService.canAccessClient(request, alarm.client_id))) {
      return response.forbidden({ message: 'No puede consultar otro recordatorio' })
    }
    return Patient.query().where('alarma_id', alarm.id).orderBy('id', 'asc')
  }
}
