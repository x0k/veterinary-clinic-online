import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { ApiRoute } from '@/trpc/model'
import { type RouterContext, appRouter } from '@/trpc/server'

import { domainPromise } from '@/edge-server-init'

export const runtime = 'edge'

function handler(request: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: ApiRoute.TRPC,
    req: request,
    router: appRouter,
    createContext: async (): Promise<RouterContext> => {
      return {
        root: await domainPromise,
      }
    },
  })
}

export const GET = handler
export const POST = handler
