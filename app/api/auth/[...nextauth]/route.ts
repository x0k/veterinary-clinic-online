import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import VKProvider from 'next-auth/providers/vk'

import {
  AUTH_SCOPES,
  AuthenticationType,
  CLIENTS_ID,
  CLIENTS_SECRET,
} from '@/models/auth'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: CLIENTS_ID[AuthenticationType.Google],
      clientSecret: CLIENTS_SECRET[AuthenticationType.Google],
      authorization: {
        params: {
          scope: AUTH_SCOPES[AuthenticationType.Google],
        },
      }
    }),
    VKProvider({
      clientId: CLIENTS_ID[AuthenticationType.VK],
      clientSecret: CLIENTS_SECRET[AuthenticationType.VK],
      authorization: {
        params: {
          scope: AUTH_SCOPES[AuthenticationType.VK],
        },
      },
    }),
  ],
  callbacks: {
  }
})

export { handler as GET, handler as POST }
