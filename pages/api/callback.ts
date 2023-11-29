import { type NextApiHandler } from 'next'

import { isString } from '@/lib/guards'
import {
  AUTHENTICATION_ERROR_QUERY_KEY,
  isAuthenticationType,
} from '@/models/auth'
import { AuthenticationService } from '@/implementation/authentication-service'

function makeErrorPath(error: string): string {
  return `/?${AUTHENTICATION_ERROR_QUERY_KEY}=${error}`
}

const handler: NextApiHandler = async (req, res) => {
  const {
    query: { code, error, error_description: errorDescription, state },
  } = req
  if (!isString(code) || !isAuthenticationType(state)) {
    res.redirect(
      makeErrorPath(
        (errorDescription as string) ?? error ?? 'Неизвестная ошибка'
      )
    )
    return
  }
  const authService = new AuthenticationService(req, res)
  try {
    await authService.authenticate(state, code)
    res.redirect('/')
  } catch (error) {
    res.redirect(
      makeErrorPath(
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      )
    )
  }
}

export default handler
