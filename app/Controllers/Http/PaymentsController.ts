import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Payment from 'App/Models/Payment'


export default class PaymentsController {
  /**
   * Maneja las notificaciones automáticas (webhooks) de ePayco.
   */
  public async handleWebhook({ request, response }: HttpContextContract) {
    const body = request.body()



  // Verificar si ya existe un registro con la misma referencia
  const existingPayment = await Payment.findBy('ref', body.x_ref_payco)

  if (existingPayment) {
    // Actualizar el estado del pago
    existingPayment.merge({ state: body.x_response })
    await existingPayment.save()

    return response.status(200).send({ message: 'Estado de pago actualizado' })
  }

    // Crear el nuevo pago
    const payment = await Payment.create({
      email: body.x_customer_email,
      name: body.x_customer_name,
      ref: body.x_ref_payco,
      client_id: body.x_extra1, // Aquí puedes agregar la lógica para encontrar el cliente si lo necesitas
      amount: body.x_amount,
      product: body.x_description,
      state: body.x_response,
    })

    // Enviar la respuesta
    return response.status(201).send(payment)
  }


  /**
   * Lista paginada de todos los pagos.
   */
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = request.input('per_page', 20)
    const payments = await Payment.query().paginate(page, perPage)
    return payments
  }

  /**
   * Obtiene los detalles de un pago específico por ID.
   */
  public async show({ params }: HttpContextContract) {
    return await Payment.findOrFail(params.id)
  }

  /**
   * Crea un nuevo registro de pago (para uso interno o manual).
   */
  public async store({ request }: HttpContextContract) {
    const body = request.body()

    // Evitar duplicados por referencia
    const existingPayment = await Payment.findBy('ref', body.ref)
    if (existingPayment) {
      return null
    }

    // Crear el pago con estado forzado a "pending"
    const newPayment = await Payment.create({
      email: body.email,
      name: body.name,
      ref: body.ref,
      client_id: body.client_id,
      amount: body.amount,
      product: body.product,
      state: 'Pendiente', // siempre pendiente al inicio
    })

    return newPayment
  }

  /**
   * Actualiza el estado de un pago existente.
   */
  public async update({ params, request }: HttpContextContract) {
    const body = request.body()
    const payment = await Payment.findOrFail(params.id)

    // Actualizar solo los campos necesarios
    payment.merge({ state: body.state })
    await payment.save()

    return payment
  }
    public async destroy({params, response}: HttpContextContract){
        const thePayment: Payment = await Payment.findOrFail(params.id);
        response.status(204);
        return thePayment.delete()
    }
}
