import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import {
  AuthenticationType,
  type SuccessAuthenticationResponses,
  type AuthenticationData,
  type AbstractAuthenticationData,
  type IAuthenticationService,
  ACCESS_TOKEN_ENDPOINTS,
  CLIENTS_ID,
  CLIENTS_SECRET,
  REDIRECT_URL,
  AUTHENTICATION_COOKIE_KEY,
} from '@/models/auth'

const AUTHENTICATION_DATA_FACTORIES: {
  [T in AuthenticationType]: (
    data: SuccessAuthenticationResponses[T]
  ) => Extract<AuthenticationData, AbstractAuthenticationData<T>>
} = {
  [AuthenticationType.Google]: (data) => ({
    t: AuthenticationType.Google,
    at: data.access_token,
    ei: data.expires_in,
  }),
  [AuthenticationType.VK]: (data) => ({
    t: AuthenticationType.VK,
    at: data.access_token,
    ei: data.expires_in,
    em: data.email,
    id: String(data.user_id),
  }),
}

export class AuthenticationService implements IAuthenticationService {
  private setAuthenticationCookie(value: string, maxAge: number): void {
    this.cookies.set(AUTHENTICATION_COOKIE_KEY, value, {
      httpOnly: true,
      maxAge,
    })
  }

  constructor(private readonly cookies: ReadonlyRequestCookies) {}

  async authenticate<T extends AuthenticationType>(
    type: T,
    code: string
  ): Promise<void> {
    const req = await fetch(
      `${ACCESS_TOKEN_ENDPOINTS[type]}?code=${code}&client_id=${CLIENTS_ID[type]}&client_secret=${CLIENTS_SECRET[type]}&redirect_uri=${REDIRECT_URL}&grant_type=authorization_code`,
      {
        method: 'POST',
      }
    )
    const data = await req.json()
    const authData = AUTHENTICATION_DATA_FACTORIES[type](data)
    this.setAuthenticationCookie(JSON.stringify(authData), authData.ei)
  }

  async loadAuthenticationData(): Promise<AuthenticationData | null> {
    const cookie = this.cookies.get(AUTHENTICATION_COOKIE_KEY)
    if (!cookie) {
      return null
    }
    try {
      return JSON.parse(cookie.value)
    } catch {
      return null
    }
  }

  async clearAuthenticationData(): Promise<void> {
    this.setAuthenticationCookie('', 0)
  }
}
