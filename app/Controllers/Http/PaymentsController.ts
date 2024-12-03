import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Payment from 'App/Models/Payment'
import Env from '@ioc:Adonis/Core/Env'  // Asegúrate de importar Env
import crypto from 'crypto';

export default class PaymentsController {
  /**
   * Maneja las notificaciones automáticas (webhooks) de ePayco.
   */
  public async handleWebhook({ request, response }: HttpContextContract) {
    const body = request.body()

    // Verificar la firma
    if (!this.verifySignature(body)) {
      return response.status(400).send({ message: 'Firma inválida' })
    }

    // Verificar si ya existe un registro con la misma referencia
    const existingPayment = await Payment.findBy('ref', body.x_ref_payco)
    if (existingPayment) {
      return response.status(200).send({ message: 'Pago ya procesado' })
    }

    // Crear el nuevo pago
    const payment = await Payment.create({
      email: body.x_customer_email,
      name: body.x_customer_name,
      ref: body.x_ref_payco,
      client_id: null, // Aquí puedes agregar la lógica para encontrar el cliente si lo necesitas
      amount: body.x_amount,
      product: body.x_description,
      state: body.x_response,
    })

    // Enviar la respuesta
    return response.status(201).send(payment)
  }

// Función para verificar la firma
private verifySignature(data: any): boolean {
  const privateKey = Env.get('EPAYCO_PRIVATE_KEY'); // Obtén la clave privada desde el archivo .env
  
  // 1. Excluimos la firma (x_signature) del cálculo y obtenemos todos los parámetros relevantes
  const { x_signature, ...params } = data;

  // 2. Decodificamos los valores que pueden contener caracteres especiales (como x_description)
  const decodedParams = Object.keys(params).reduce((acc, key) => {
    acc[key] = decodeURIComponent(params[key]); // Decodifica los parámetros
    return acc;
  }, {} as any);

  // 3. Ordenamos los parámetros alfabéticamente (en base a las claves)
  const sortedData = Object.keys(decodedParams)
  .sort() // Ordenamos alfabéticamente las claves
  .map(key => `${key}=${decodedParams[key] || ''}`) // Usar cadena vacía si el valor es nulo o undefined
  .join('&');

  // 4. Generamos la firma utilizando la clave privada de ePayco y los parámetros ordenados
  const generatedSignature = crypto
    .createHmac('sha256', privateKey) // Usamos SHA256 para la firma
    .update(sortedData) // Calculamos el hash con los datos ordenados
    .digest('hex'); // Generamos el hash en formato hexadecimal

  // 5. Comparar la firma generada con la firma recibida
  console.log('Firma generada:', generatedSignature);  // Para depuración
  console.log('Firma recibida:', x_signature);         // Para depuración

  return generatedSignature === x_signature; // Comparamos las firmas
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
    console.log('Datos recibidos:', body)

    // Verificar si ya existe un pago con la misma referencia
    const existingPayment = await Payment.findBy('ref', body.ref)
    if (existingPayment) {
      return null
    }

    // Crear el nuevo pago
    const newPayment = await Payment.create(body)
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
}
