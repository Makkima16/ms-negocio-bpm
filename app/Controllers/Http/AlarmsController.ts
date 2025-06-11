import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Alarm from 'App/Models/Alarm';
import { DateTime } from 'luxon';
import Env from '@ioc:Adonis/Core/Env'

export default class AlarmsController {
  public async store({ request }: HttpContextContract) {
    const body = request.body()

    const scheduledDate = DateTime.now().plus({ days:4 });

    const theAlarm = await Alarm.create({
      client_id: body.client_id,
      subject: body.subject,
      content: body.content,
      date: scheduledDate,
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
    public async checkNearAlarms({ request,response }: HttpContextContract) {
    const token = request.input('token')
    if (token !== Env.get('ALARM_SECRET_TOKEN')) {
      return response.unauthorized('Unauthorized')
  }
    const today = DateTime.now().startOf('day')
    const fiveDaysLater = today.plus({ days: 5 }).endOf('day')

    // Buscar todas las alarmas cuya fecha esté entre hoy y 5 días más
    const nearAlarms = await Alarm.query()
      .where('date', '>=', today.toISO())
      .andWhere('date', '<=', fiveDaysLater.toISO())
      .preload('cliente')

    // Aquí podrías invocar tu microservicio de envío de correo por cada alarma
    // Ejemplo ficticio:
    // for (const alarm of nearAlarms) {
    //   await sendEmail(alarm)
    // }

    // Por ahora devolvemos las alarmas encontradas
    return response.ok({
      total: nearAlarms.length,
      data: nearAlarms,
    })
  }
}
