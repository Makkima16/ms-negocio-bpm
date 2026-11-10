import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/AuthService'

export default class AuthMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const user = AuthService.getUser(request)
    if (!user) {
      return response.unauthorized({ message: 'No autorizado' })
    }
    await next()
  }
}
