import NextAuth from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'
import VKProvider from 'next-auth/providers/vk'

import { AUTH_SCOPES, AuthenticationType } from '@/models/auth'

import { env } from './server-env'
import { env as envClient } from './client-ent'

const CLIENTS_ID: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: envClient.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  [AuthenticationType.VK]: envClient.NEXT_PUBLIC_VK_CLIENT_ID,
}

const CLIENTS_SECRET: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: env.GOOGLE_CLIENT_SECRET,
  [AuthenticationType.VK]: env.VK_CLIENT_SECRET,
}

export const {
  handlers: { GET, POST },
  auth,
  signOut,
} = NextAuth({
  providers: [
    // GoogleProvider({
    //   clientId: CLIENTS_ID[AuthenticationType.Google],
    //   clientSecret: CLIENTS_SECRET[AuthenticationType.Google],
    //   authorization: {
    //     params: {
    //       scope: AUTH_SCOPES[AuthenticationType.Google],
    //     },
    //   },
    // }),
    VKProvider({
      clientId: CLIENTS_ID[AuthenticationType.VK],
      clientSecret: CLIENTS_SECRET[AuthenticationType.VK],
      authorization: {
        params: {
          scope: AUTH_SCOPES[AuthenticationType.VK],
        },
      },
      checks: ['state'],
    }),
  ],
  callbacks: {
    session({ token, session }) {
      const provider = token.provider
      const accountId = token.providerAccountId
      if (typeof provider === 'string' && typeof accountId === 'string') {
        const userId = `${provider}-${accountId}`
        if (session.user) {
          session.user.id = userId
        } else {
          session.user = {
            id: userId,
            email: token.email ?? '',
            emailVerified: null,
          }
        }
      }
      return session
    },
    jwt({ token, account }) {
      if (account) {
        token.provider = account.provider
        token.providerAccountId = String(account.providerAccountId)
      }
      return token
    },
  },
})
