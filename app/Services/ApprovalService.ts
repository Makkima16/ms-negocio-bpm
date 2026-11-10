import Database from '@ioc:Adonis/Lucid/Database'
import Modulo from 'App/Models/Modulo'
import Payment from 'App/Models/Payment'

class ApprovalService {
  /**
   * A module is considered passed when the client has at least one approved
   * register for one of the exams that belong to that module.
   */
  public async clientPassedModule(clientId: number, moduleId: number): Promise<boolean> {
    const exams = await Database.from('exams')
      .where('module_id', moduleId)
      .select('id')

    if (exams.length === 0) return false

    const passed = await Database.from('registers')
      .where('client_id', clientId)
      .whereIn('examen_id', exams.map((exam) => exam.id))
      .andWhere('aprobacion', true)
      .first()

    return !!passed
  }

  /**
   * Course types are stored with inconsistent casing across records, so the
   * comparison is case-insensitive.
   */
  public async clientCompletedCourseType(
    clientId: number,
    cursoTipo: string
  ): Promise<{ completed: boolean; modules: Modulo[] }> {
    const modules = await Modulo.query().whereRaw(
      'LOWER(curso_tipo) = ?',
      [cursoTipo.toLowerCase()]
    )

    if (modules.length === 0) {
      return { completed: false, modules }
    }

    for (const modulo of modules) {
      if (!(await this.clientPassedModule(clientId, modulo.id))) {
        return { completed: false, modules }
      }
    }

    return { completed: true, modules }
  }

  public async hasAcceptedPayment(clientId: number): Promise<boolean> {
    const payment = await Payment.query()
      .where('client_id', clientId)
      .where('state', 'Aceptada')
      .first()
    return !!payment
  }
}

export default new ApprovalService()
