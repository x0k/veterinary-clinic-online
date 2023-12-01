import NextAuth from 'next-auth'
import GoogleProvider from '@auth/core/providers/google'
import VKProvider from '@auth/core/providers/vk'

import {
  AUTH_SCOPES,
  AuthenticationType,
  CLIENTS_ID,
  CLIENTS_SECRET,
} from '@/models/auth'

export const {
  handlers: { GET, POST },
  auth,
  signOut,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: CLIENTS_ID[AuthenticationType.Google],
      clientSecret: CLIENTS_SECRET[AuthenticationType.Google],
      authorization: {
        params: {
          scope: AUTH_SCOPES[AuthenticationType.Google],
        },
      },
    }),
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
    session(arg) {
      console.log('SESSION----', JSON.stringify(arg))
      if (arg.token.sub) {
        if (arg.session.user) {
          arg.session.user.id = arg.token.sub
        } else {
          arg.session.user = { id: arg.token.sub }
        }
      }
      return arg.session
    },
    jwt(arg) {
      console.log('JWT----', JSON.stringify(arg))
      return arg.token
    },
  },
})
