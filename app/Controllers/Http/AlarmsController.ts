import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Alarm from 'App/Models/Alarm';
import { DateTime } from 'luxon';
import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

export default class AlarmsController {
public async store({ request }: HttpContextContract) {
  const body = request.body()

  // Si envía fecha, usarla. Si no, usar fecha dentro de 3 meses.
  const scheduledDate = body.date
    ? DateTime.fromISO(body.date)
    : DateTime.now().plus({ months: 3 })

  const theAlarm = await Alarm.create({
    client_id: body.client_id,
    subject: body.subject,
    content: body.content,
    date: scheduledDate,
    servidor:body.servidor,
  })

  return theAlarm
}

    public async index({request}: HttpContextContract){
        const page =request.input('page', 1);
        const perPage = request.input("per_page", 20)
        let Alarms:Alarm[]=await Alarm.query().paginate(page, perPage)
        return Alarms;
    }
    public async show({params}:HttpContextContract){
        return Alarm.findOrFail(params.id)
    }

    public async destroy({params, response}: HttpContextContract){
        const theAlarm: Alarm = await Alarm.findOrFail(params.id);
        response.status(204);
        return theAlarm.delete()
    }
public async checkNearAlarms({ request, response }: HttpContextContract) {
  const token = request.input('token')
  if (token !== Env.get('ALARM_SECRET_TOKEN')) {
    return response.unauthorized('Unauthorized')
  }

  const today = DateTime.now().startOf('day')
  const fiveDaysLater = today.plus({ days: 5 }).endOf('day')

  const nearAlarms = await Alarm.query()
    .where('date', '>=', today.toISO())
    .andWhere('date', '<=', fiveDaysLater.toISO())
    .preload('cliente')

  const correosEnviados: {
    alarm_id: number
    email: string
    status: 'enviado' | 'error'
    result?: any
    error?: any
  }[] = []
  for (const alarm of nearAlarms) {
    const email = alarm.cliente?.email

    if (!email) {
      console.warn(`No se encontró el email para el cliente ID ${alarm.client_id}`)
      continue
    }

    try {
      const responseCorreo = await axios.post(`${Env.get('MS_CORREOS')}/enviar-recordatorio`, {
        email,
        subject: alarm.subject,
        content: alarm.content,
        date: alarm.date,
      })

      correosEnviados.push({
        alarm_id: alarm.id,
        email,
        status: 'enviado',
        result: responseCorreo.data,
      })
    } catch (error) {
      correosEnviados.push({
        alarm_id: alarm.id,
        email,
        status: 'error',
        error: error.response?.data || error.message,
      })
    }
  }

  return response.ok({
    total: nearAlarms.length,
    enviados: correosEnviados.length,
    resultados: correosEnviados,
  })
}


}
