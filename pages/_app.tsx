import { FunctionComponent } from 'react'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'

import { AUTHENTICATION_COOKIE_KEY } from '@/models/auth'
import { UserProvider } from '@/domains/user'
import { AuthProvider } from '@/domains/auth'
import { AuthenticationService } from '@/implementation/authentication-service'
import { UserService } from '@/implementation/user-service'
import { makeUserHandlers } from '@/adapters/user-handlers'
import { makeAuthHandlers } from '@/adapters/auth-handlers'
import '@/styles/globals.css'

let App: FunctionComponent<AppProps>

if (typeof window === 'undefined') {
  // eslint-disable-next-line react/display-name
  App = ({ Component, pageProps }: AppProps) => (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
} else {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  })
  const authService = new AuthenticationService(
    localStorage,
    AUTHENTICATION_COOKIE_KEY
  )
  const userService = new UserService()

  const authHandlers = makeAuthHandlers(authService)
  const userHandlers = makeUserHandlers(userService)

  // eslint-disable-next-line react/display-name
  App = ({ Component, pageProps }: AppProps): JSX.Element => (
    <QueryClientProvider client={client}>
      <AuthProvider handlers={authHandlers}>
        <UserProvider handlers={userHandlers}>
          <ChakraProvider>
            <Component {...pageProps} />
          </ChakraProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
