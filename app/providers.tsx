'use client'
import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

import { UserProvider } from '@/domains/user'

import { client, trpc, trpcClient } from './init-client'

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={client}>
        <QueryClientProvider client={client}>
          <UserProvider>{children}</UserProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
