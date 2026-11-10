import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Payment from 'App/Models/Payment'
import Client from 'App/Models/Client'
import AuthService from 'App/Services/AuthService'
import { createHash, timingSafeEqual } from 'crypto'

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATE_MAP: Record<string, string> = {
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  pendiente: 'Pendiente',
  fallida: 'Fallida',
  reversada: 'Reversada',
}

function normalizeState(raw: unknown): string {
  if (typeof raw !== 'string') return 'Pendiente'
  return STATE_MAP[raw.trim().toLowerCase()] ?? 'Pendiente'
}

export default class PaymentsController {
  /**
   * ePayco confirmation webhook. The request is only accepted when its
   * signature can be recomputed with the merchant credentials.
   */
  public async handleWebhook({ request, response }: HttpContextContract) {
    const body: any = request.body()

    if (!this.verifyEpaycoSignature(body)) {
      return response.unauthorized({ message: 'Firma de webhook inválida' })
    }

    const ref = body.x_ref_payco
    const amount = Number(body.x_amount)
    if (!ref || !body.x_customer_email || Number.isNaN(amount) || amount <= 0) {
      return response.badRequest({ message: 'Notificación de pago incompleta' })
    }

    const state = normalizeState(body.x_response)
    const clientId = Number(body.x_extra1)
    const client = Number.isFinite(clientId) ? await Client.find(clientId) : null

    const existingPayment = await Payment.findBy('ref', String(ref))
    if (existingPayment) {
      existingPayment.merge({ state })
      await existingPayment.save()
      return response.ok({ message: 'Estado de pago actualizado' })
    }

    const payment = await Payment.create({
      email: body.x_customer_email ?? null,
      name: body.x_customer_name ?? null,
      ref: String(ref),
      client_id: client ? client.id : null,
      amount,
      product: body.x_description ?? null,
      state,
    })

    return response.created(payment)
  }

  /** A client registers the payment reference they used in ePayco. */
  public async store({ request, response }: HttpContextContract) {
    const body = request.only(['email', 'name', 'ref', 'client_id', 'amount', 'product'])

    const ref = typeof body.ref === 'string' ? body.ref.trim() : ''
    const amount = Number(body.amount)
    if (!ref) {
      return response.badRequest({ message: 'La referencia de pago es obligatoria' })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return response.badRequest({ message: 'El monto del pago no es válido' })
    }

    const existingPayment = await Payment.findBy('ref', ref)
    if (existingPayment) {
      return response.conflict({ message: 'Ya existe un pago con esa referencia' })
    }

    const clientId = await AuthService.resolveClientId(request, body.client_id)
    if (!clientId) {
      return response.forbidden({ message: 'No se pudo identificar el cliente' })
    }

    const newPayment = await Payment.create({
      email: body.email ?? null,
      name: body.name ?? null,
      ref,
      client_id: clientId,
      amount,
      product: body.product ?? null,
      state: 'Pendiente',
    })

    return response.created(newPayment)
  }

  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const perPage = Math.min(Number(request.input('per_page', 20)), 100)
    return Payment.query().paginate(page, perPage)
  }

  public async show({ params, response }: HttpContextContract) {
    const payment = await Payment.find(params.id)
    if (!payment) {
      return response.notFound({ message: 'Pago no encontrado' })
    }
    return payment
  }

  /** Only administrators reach this endpoint (route middleware). */
  public async update({ params, request, response }: HttpContextContract) {
    const body = request.only(['state'])
    const requested = typeof body.state === 'string' ? body.state.trim().toLowerCase() : ''
    const state = STATE_MAP[requested]
    if (!state) {
      return response.badRequest({ message: 'Estado de pago no válido' })
    }

    const payment = await Payment.find(params.id)
    if (!payment) {
      return response.notFound({ message: 'Pago no encontrado' })
    }

    payment.merge({ state })
    await payment.save()
    return payment
  }

  public async destroy({ params, response }: HttpContextContract) {
    const payment = await Payment.find(params.id)
    if (!payment) {
      return response.notFound({ message: 'Pago no encontrado' })
    }
    await payment.delete()
    return response.noContent()
  }

  private verifyEpaycoSignature(body: Record<string, unknown>): boolean {
    const customerId = Env.get('EPAYCO_CUSTOMER_ID', '')
    const privateKey = Env.get('EPAYCO_P_KEY', '')
    const signature = body?.x_signature
    if (!customerId || !privateKey || !signature) return false

    const raw = [
      customerId,
      privateKey,
      body.x_ref_payco,
      body.x_transaction_id,
      body.x_amount,
      body.x_currency_code,
    ]
      .map((value) => (value === undefined || value === null ? '' : String(value)))
      .join('^')

    const expected = Buffer.from(createHash('md5').update(raw).digest('hex'))
    const provided = Buffer.from(String(signature).trim().toLowerCase())
    return expected.length === provided.length && timingSafeEqual(expected, provided)
  }
}
