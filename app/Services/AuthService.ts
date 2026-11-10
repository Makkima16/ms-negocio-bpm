import type { RequestContract } from '@ioc:Adonis/Core/Request'
import Client from 'App/Models/Client'
import JwtService, { JwtPayload } from 'App/Services/JwtService'

class AuthService {
  public getUser(request: RequestContract): JwtPayload | null {
    const token = JwtService.extractToken(request.header('Authorization'))
    return JwtService.verify(token)
  }

  public isAdmin(request: RequestContract): boolean {
    const user = this.getUser(request)
    return user?.role?.name?.toLowerCase() === 'administrador'
  }

  public async getCurrentClient(request: RequestContract): Promise<Client | null> {
    const user = this.getUser(request)
    if (!user?.email) return null
    return Client.findBy('email', user.email)
  }

  /**
   * Returns the client id the request is allowed to operate on. Administrators
   * may target any client; regular users are always scoped to their own client,
   * which prevents IDOR attacks.
   */
  public async resolveClientId(
    request: RequestContract,
    suppliedClientId?: number | null
  ): Promise<number | null> {
    const supplied =
      suppliedClientId !== null && suppliedClientId !== undefined && Number.isFinite(suppliedClientId)
        ? Number(suppliedClientId)
        : null

    if (this.isAdmin(request) && supplied) {
      return supplied
    }
    const client = await this.getCurrentClient(request)
    return client ? client.id : null
  }

  public async canAccessClient(request: RequestContract, clientId: number): Promise<boolean> {
    if (this.isAdmin(request)) return true
    const client = await this.getCurrentClient(request)
    return !!client && client.id === Number(clientId)
  }
}

export default new AuthService()
