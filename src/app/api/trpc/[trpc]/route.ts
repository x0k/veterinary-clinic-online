import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { ApiRoute } from '@/trpc/model'
import { type RouterContext, appRouter } from '@/trpc/server'
import { clinicService } from '@/init-server'

function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: ApiRoute.TRPC,
    req: request,
    router: appRouter,
    createContext: (): RouterContext => {
      return {
        clinicService,
      }
    },
  })
}

export const GET = handler
export const POST = handler
