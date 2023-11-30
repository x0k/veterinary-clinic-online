'use client'
import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

import { UserProvider } from '@/domains/user'

import { client, trpc, trpcClient } from './init-client'

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <trpc.Provider client={trpcClient} queryClient={client}>
      <QueryClientProvider client={client}>
        <UserProvider trpc={trpc} >
          <CacheProvider>
            <ChakraProvider>{children}</ChakraProvider>
          </CacheProvider>
        </UserProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
