import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/AuthService'

export default class AdminOnlyMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    if (!AuthService.isAdmin(request)) {
      return response.forbidden({ message: 'Requiere rol de administrador' })
    }
    await next()
  }
}
