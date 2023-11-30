import { cookies } from 'next/headers'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { ApiRoute } from '@/models/app'
import { type RouterContext, appRouter } from '@/implementation/trpc-server'
import { UserService } from '@/implementation/user-service'
import { AuthenticationService } from '@/implementation/authentication-service'

import { clinicService } from '@/app/init-server'

function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: ApiRoute.TRPC,
    req: request,
    router: appRouter,
    createContext: (): RouterContext => {
      const authService = new AuthenticationService(cookies())
      return {
        clinicService,
        authService,
        userService: new UserService(authService),
      }
    },
  })
}

export const GET = handler
export const POST = handler
