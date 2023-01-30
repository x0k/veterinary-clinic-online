import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import axios from 'axios'

import {
  AbstractAuthenticationData,
  ACCESS_TOKEN_ENDPOINTS,
  AuthenticationData,
  AuthenticationType,
  AUTHENTICATION_COOKIE_KEY,
  CLIENTS_ID,
  CLIENTS_SECRET,
  IAuthenticationService,
  REDIRECT_URL,
  SuccessAuthenticationResponses,
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
    this.res.setHeader(
      'Set-Cookie',
      serialize(AUTHENTICATION_COOKIE_KEY, value, {
        httpOnly: true,
        maxAge,
      })
    )
  }

  constructor(
    private readonly req: NextApiRequest,
    private readonly res: NextApiResponse
  ) {}

  async authenticate<T extends AuthenticationType>(
    type: T,
    code: string
  ): Promise<void> {
    const { data } = await axios.post<SuccessAuthenticationResponses[T]>(
      `${ACCESS_TOKEN_ENDPOINTS[type]}?code=${code}&client_id=${CLIENTS_ID[type]}&client_secret=${CLIENTS_SECRET[type]}&redirect_uri=${REDIRECT_URL}&grant_type=authorization_code`
    )
    const authData = AUTHENTICATION_DATA_FACTORIES[type](data)
    this.setAuthenticationCookie(JSON.stringify(authData), authData.ei)
  }

  async loadAuthenticationData(): Promise<AuthenticationData | null> {
    const value = this.req.cookies[AUTHENTICATION_COOKIE_KEY]
    if (!value) {
      return null
    }
    return JSON.parse(value)
  }

  async clearAuthenticationData(): Promise<void> {
    this.setAuthenticationCookie('', 0)
  }
}
