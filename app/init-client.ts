import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import { QueryClient } from '@tanstack/react-query'

import { ApiRoute } from '@/models/app'
import type { AppRouter } from '@/implementation/trpc-server'
import '@/public/wasm_exec.js'

export const trpc = createTRPCReact<AppRouter>()

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: ApiRoute.TRPC,
    }),
  ],
})
