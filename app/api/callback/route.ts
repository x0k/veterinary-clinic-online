import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

import { isString } from '@/lib/guards'
import {
  AUTHENTICATION_ERROR_QUERY_KEY,
  isAuthenticationType,
} from '@/models/auth'
import { AuthenticationService } from '@/implementation/authentication-service'

function makeErrorPath(error: string): string {
  return `/?${AUTHENTICATION_ERROR_QUERY_KEY}=${error}`
}

export async function GET(req: NextRequest): Promise<never> {
  const {
    code,
    error = 'Неизвестная ошибка',
    error_description: errorDescription,
    state,
  } = Object.fromEntries(req.nextUrl.searchParams)
  if (!isString(code) || !isAuthenticationType(state)) {
    redirect(makeErrorPath(errorDescription ?? error))
  }
  const authService = new AuthenticationService(cookies())
  try {
    await authService.authenticate(state, code)
    redirect('/')
  } catch (error) {
    redirect(
      makeErrorPath(
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      )
    )
  }
}
