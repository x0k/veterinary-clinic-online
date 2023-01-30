import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'

import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { ApiRoutes } from '@/models/app'
import { UserProvider } from '@/domains/user'
import { makeUserHandlers } from '@/adapters/user-handlers'
import '@/styles/globals.css'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})
const userHandlers = makeUserHandlers(makeRPCClient(ApiRoutes.User))

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <QueryClientProvider client={client}>
      <UserProvider handlers={userHandlers}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </UserProvider>
    </QueryClientProvider>
  )
}
