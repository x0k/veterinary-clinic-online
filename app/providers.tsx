'use client'
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { ApiRoutes } from '@/models/app'
import { UserProvider } from '@/domains/user'
import { makeUserHandlers } from '@/adapters/user-handlers'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})
const userHandlers = makeUserHandlers(makeRPCClient(ApiRoutes.User))

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={client}>
      <UserProvider handlers={userHandlers}>
        <CacheProvider>
          <ChakraProvider>{children}</ChakraProvider>
        </CacheProvider>
      </UserProvider>
    </QueryClientProvider>
  )
}
