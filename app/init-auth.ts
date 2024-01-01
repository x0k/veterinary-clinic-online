import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import VKProvider from 'next-auth/providers/vk'
// import GoogleProvider from '@auth/core/providers/google'
// import VKProvider from '@auth/core/providers/vk'

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
      if (arg.token.sub) {
        if (arg.session.user) {
          arg.session.user.id = arg.token.sub
        } else {
          arg.session.user = { id: arg.token.sub }
        }
      }
      switch (arg.token.provider) {
        case AuthenticationType.VK: {
          if (arg.session.user) {
            arg.session.user.name = arg.token.name
          }
        }
      }
      return arg.session
    },
    jwt(arg) {
      const { provider } = arg.account ?? {}
      arg.token.provider = provider
      if (provider === AuthenticationType.VK) {
        arg.token.email = arg.account?.email as string
      }
      return arg.token
    },
  },
})
