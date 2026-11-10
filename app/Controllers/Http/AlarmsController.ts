import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Alarm from 'App/Models/Alarm'
import { DateTime } from 'luxon'
import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import AuthService from 'App/Services/AuthService'
import { timingSafeEqual } from 'crypto'

export default class AlarmsController {
  public async store({ request, response }: HttpContextContract) {
    const body = request.only(['client_id', 'subject', 'content', 'date', 'servidor'])

    if (!body.subject || !body.content || !body.servidor) {
      return response.badRequest({ message: 'subject, content y servidor son obligatorios' })
    }

    const clientId = await AuthService.resolveClientId(
      request,
      body.client_id ? Number(body.client_id) : null
    )
    if (!clientId) {
      return response.forbidden({ message: 'No se pudo identificar el cliente' })
    }

    let scheduledDate = DateTime.now().plus({ months: 3 })
    if (body.date) {
      const parsed = DateTime.fromISO(String(body.date))
      if (!parsed.isValid) {
        return response.badRequest({ message: 'La fecha del recordatorio no es válida' })
      }
      scheduledDate = parsed
    }

    const theAlarm = await Alarm.create({
      client_id: clientId,
      subject: body.subject,
      content: body.content,
      date: scheduledDate,
      servidor: body.servidor,
    })
    return response.created(theAlarm)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Alarm.query().orderBy('date', 'asc').paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const alarm = await Alarm.find(params.id)
    if (!alarm) {
      return response.notFound({ message: 'Recordatorio no encontrado' })
    }
    return alarm
  }

  public async update({ params, request, response }: HttpContextContract) {
    const alarm = await Alarm.find(params.id)
    if (!alarm) {
      return response.notFound({ message: 'Recordatorio no encontrado' })
    }

    const body = request.only(['subject', 'content', 'date', 'servidor'])
    if (body.date) {
      const parsed = DateTime.fromISO(String(body.date))
      if (!parsed.isValid) {
        return response.badRequest({ message: 'La fecha del recordatorio no es válida' })
      }
      alarm.date = parsed
    }
    if (body.subject) alarm.subject = body.subject
    if (body.content) alarm.content = body.content
    if (body.servidor) alarm.servidor = body.servidor

    await alarm.save()
    return alarm
  }

  public async destroy({ params, response }: HttpContextContract) {
    const alarm = await Alarm.find(params.id)
    if (!alarm) {
      return response.notFound({ message: 'Recordatorio no encontrado' })
    }
    await alarm.delete()
    return response.noContent()
  }

  /**
   * Automation endpoint (cron) that emails clients with alarms in the following
   * five days. Protected with a shared token compared in constant time.
   */
  public async checkNearAlarms({ request, response }: HttpContextContract) {
    const configuredToken = Env.get('ALARM_SECRET_TOKEN', '')
    const providedToken = request.input('token') ?? request.header('x-alarm-token')

    if (!configuredToken || !this.safeEqual(String(providedToken ?? ''), configuredToken)) {
      return response.unauthorized('Unauthorized')
    }

    const mailService = Env.get('MS_CORREOS', '').replace(/\/$/, '')
    if (!mailService) {
      return response.serviceUnavailable({ message: 'MS_CORREOS no está configurado' })
    }

    const today = DateTime.now().startOf('day')
    const fiveDaysLater = today.plus({ days: 5 }).endOf('day')

    const nearAlarms = await Alarm.query()
      .where('date', '>=', today.toISO())
      .andWhere('date', '<=', fiveDaysLater.toISO())
      .preload('cliente')

    const results: Array<Record<string, unknown>> = []
    for (const alarm of nearAlarms) {
      const email = alarm.cliente?.email
      if (!email) {
        results.push({ alarm_id: alarm.id, status: 'error', error: 'Cliente sin correo' })
        continue
      }

      try {
        const emailResponse = await axios.post(
          `${mailService}/enviar-recordatorio`,
          {
            email,
            subject: alarm.subject,
            content: alarm.content,
            date: alarm.date,
          },
          { timeout: 10000 }
        )
        results.push({ alarm_id: alarm.id, email, status: 'enviado', result: emailResponse.data })
      } catch (error: any) {
        results.push({
          alarm_id: alarm.id,
          email,
          status: 'error',
          error: error.response?.data ?? error.message,
        })
      }
    }

    return response.ok({
      total: nearAlarms.length,
      enviados: results.filter((item) => item.status === 'enviado').length,
      resultados: results,
    })
  }

  private safeEqual(provided: string, expected: string): boolean {
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  }
}
