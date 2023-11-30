import { Client as NotionClient } from '@notionhq/client'
import {
  type FetchCreateContextFnOptions,
  fetchRequestHandler,
} from '@trpc/server/adapters/fetch'

import { NOTION_AUTH } from '@/models/notion'
import { type RouterContext, appRouter } from '@/implementation/trpc-server'
import { ClinicService } from '@/implementation/clinic-service'

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
    createContext: function (opts: FetchCreateContextFnOptions): RouterContext {
      return {
        clinicService,
      }
    },
  })
}

export const GET = handler
export const POST = handler
