import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Payment from 'App/Models/Payment'
import Aprobado from 'App/Models/Aprobado'
import Client from 'App/Models/Client'
import Modulo from 'App/Models/Modulo'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async summary({ response }: HttpContextContract) {
    const now = DateTime.now()
    const startOfMonth = now.startOf('month').toISO()

    // 1. Cantidad de personas que pagaron este mes (pagos aceptados)
    const pagosDelMes = await Payment
      .query()
      .where('state', 'Aceptada')
      .where('created_at', '>=', startOfMonth)

    const totalPagosMes = pagosDelMes.length

    // 2. Total dinero recolectado este mes
    const totalRecaudadoMes = pagosDelMes.reduce((sum, pago) => sum + (pago.amount || 0), 0)

    // 3. Cantidad de personas que completaron cursos
    const totalAprobados = await Aprobado.query().count('* as total')
    const totalCompletados = Number(totalAprobados[0].$extras.total)

    // 4. Cantidad total de cursos activos (asumimos todos los módulos lo están)
    const totalCursos = await Modulo.query().count('* as total')
    const cursosActivos = Number(totalCursos[0].$extras.total)

    // 5. Últimos 5 clientes
    const ultimosClientes = await Client
      .query()
      .orderBy('created_at', 'desc')
      .limit(5)

    return response.ok({
      totalPagosMes,
      totalRecaudadoMes,
      totalCompletados,
      cursosActivos,
      ultimosClientes
    })
  }
}
