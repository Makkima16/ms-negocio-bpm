import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Client from 'App/Models/Client'
import { DateTime } from 'luxon'

export default class DashboardController {
  /** Aggregations are done in SQL instead of loading every row into memory. */
  public async summary({ response }: HttpContextContract) {
    const startOfMonth = DateTime.now().startOf('month').toFormat('yyyy-MM-dd HH:mm:ss')

    const paymentsAggregate = await Database.from('payments')
      .where('state', 'Aceptada')
      .where('created_at', '>=', startOfMonth)
      .count('*', 'total')
      .sum('amount', 'amount')

    const aprobadosAggregate = await Database.from('aprobados').count('*', 'total')
    const modulosAggregate = await Database.from('modulos').count('*', 'total')

    const ultimosClientes = await Client.query()
      .orderBy('created_at', 'desc')
      .limit(5)

    return response.ok({
      totalPagosMes: Number(paymentsAggregate[0]?.total ?? 0),
      totalRecaudadoMes: Number(paymentsAggregate[0]?.amount ?? 0),
      totalCompletados: Number(aprobadosAggregate[0]?.total ?? 0),
      cursosActivos: Number(modulosAggregate[0]?.total ?? 0),
      ultimosClientes,
    })
  }
}
