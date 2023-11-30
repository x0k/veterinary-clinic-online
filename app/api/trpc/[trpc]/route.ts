import { cookies } from 'next/headers'
import { Client as NotionClient } from '@notionhq/client'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { NOTION_AUTH } from '@/models/notion'
import { type RouterContext, appRouter } from '@/implementation/trpc-server'
import { ClinicService } from '@/implementation/clinic-service'
import { UserService } from '@/implementation/user-service'
import { AuthenticationService } from '@/implementation/authentication-service'

const clinicService = new ClinicService(
  new NotionClient({
    auth: NOTION_AUTH,
  })
)

function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
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
