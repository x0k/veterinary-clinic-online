import { createTRPCClient, createTRPCReact, httpBatchLink } from '@trpc/react-query'
import { QueryClient } from '@tanstack/react-query'

import { ApiRoute, type AppRouter } from './trpc/model'

export const trpc = createTRPCReact<AppRouter>()

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export const trpcReactClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: ApiRoute.TRPC,
    }),
  ],
})

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: ApiRoute.TRPC,
    })
  ]
})
