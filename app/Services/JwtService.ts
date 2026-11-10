import { createHmac, timingSafeEqual } from 'crypto'
import Env from '@ioc:Adonis/Core/Env'

export interface JwtRole {
  _id?: string
  name?: string
  description?: string
}

export interface JwtPayload {
  _id: string
  name?: string
  email?: string
  role?: JwtRole
  iat?: number
  exp?: number
}

/**
 * Verifies the HS512 tokens issued by ms-security. No external dependency is
 * needed: the signature is recomputed with Node's crypto module.
 */
class JwtService {
  private getSecret(): string {
    return Env.get(
      'JWT_SECRET',
      'dev-only-secret-change-me-0123456789abcdef0123456789abcdef0123456789abcdef'
    )
  }

  public verify(token: string | null | undefined): JwtPayload | null {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts

    try {
      const expected = createHmac('sha512', this.getSecret())
        .update(`${header}.${payload}`)
        .digest()
      const provided = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

      if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
        return null
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as JwtPayload

      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        return null
      }

      return decoded
    } catch {
      return null
    }
  }

  public extractToken(authorizationHeader?: string | null): string | null {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null
    const token = authorizationHeader.substring(7).trim()
    return token.length > 0 ? token : null
  }
}

export default new JwtService()
