import { useEffect } from 'react'
import { useRouter } from 'next/router'

import {
  AuthenticationType,
  AUTHENTICATION_ERROR_QUERY_KEY,
  isAuthenticationType,
  isErrorAuthenticationResponse,
  SUCCESS_AUTHENTICATION_RESPONSE_VALIDATORS,
} from '@/models/auth'
import { AppRoute } from '@/models/app'
import { useAuthentication } from '@/domains/auth'

function makeErrorRoute(message: string): string {
  return `${
    AppRoute.Home
  }?${AUTHENTICATION_ERROR_QUERY_KEY}=${encodeURIComponent(message)}`
}

const AUTH_TYPE_TITLES: Record<AuthenticationType, string> = {
  [AuthenticationType.VK]: 'VK',
  [AuthenticationType.Google]: 'Google',
}

export default function CallbackPage<T extends AuthenticationType>(): null {
  const { asPath, push } = useRouter()
  const { login } = useAuthentication()
  useEffect(() => {
    const params = new URLSearchParams(asPath.split('#')[1])
    const data = Object.fromEntries(params.entries())
    const { state } = data
    if (!isAuthenticationType<T>(state)) {
      void push(
        makeErrorRoute(
          isErrorAuthenticationResponse(data)
            ? data.error_description ?? data.error
            : 'Неизвестная ошибка в процессе аутентификации'
        )
      )
      return
    }
    const successValidator = SUCCESS_AUTHENTICATION_RESPONSE_VALIDATORS[state]
    if (successValidator(data)) {
      login(data)
      void push(AppRoute.Home)
      return
    }
    void push(
      makeErrorRoute(
        `Ошибка при получении токена доступа от ${AUTH_TYPE_TITLES[state]}`
      )
    )
  }, [login, push, asPath])
  return null
}
