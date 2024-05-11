'use client'
import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

import { UserProvider } from '@/domains/user'

import { client, trpc, trpcReactClient } from './init-client'

export function Providers({ children }: PropsWithChildren): JSX.Element {
  return (
    <SessionProvider>
      <trpc.Provider client={trpcReactClient} queryClient={client}>
        <QueryClientProvider client={client}>
          <UserProvider>{children}</UserProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}
