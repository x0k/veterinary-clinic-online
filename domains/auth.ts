import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { noop } from '@/lib/function'
import {
  Authentication,
  AuthenticationData,
  AuthenticationType,
  SuccessAuthenticationResponses,
} from '@/models/auth'
import { queryKey } from '@/models/app'

const AuthContext = createContext<Authentication>({
  authenticationData: null,
  login: noop,
  logout: noop,
})

export function useAuthentication(): Authentication {
  return useContext(AuthContext)
}

export interface AuthHandlers {
  saveAuthenticationData: <T extends AuthenticationType>(
    data: SuccessAuthenticationResponses[T]
  ) => Promise<void>
  loadAuthenticationData: () => Promise<AuthenticationData | null>
  clearAuthenticationData: () => Promise<void>
}

export interface AuthProviderProps {
  children: ReactNode
  handlers: AuthHandlers
}

export function AuthProvider({
  children,
  handlers,
}: AuthProviderProps): JSX.Element {
  const queryClient = useQueryClient()
  const { data: authenticationData } = useQuery(
    queryKey.auth,
    handlers.loadAuthenticationData,
    {
      initialData: null,
    }
  )
  if (authenticationData === undefined) {
    throw new TypeError(`Authentication shouldn't be undefined`)
  }
  const { mutate: saveAuthenticationData } = useMutation(
    async (data: SuccessAuthenticationResponses[AuthenticationType]) => {
      await handlers.saveAuthenticationData(data)
    },
    {
      onSuccess() {
        void queryClient.invalidateQueries(queryKey.auth)
      },
    }
  )
  const { mutate: logout } = useMutation(handlers.clearAuthenticationData, {
    onSuccess() {
      queryClient.setQueryData(queryKey.auth, null)
    },
  })
  const value: Authentication = useMemo(
    () => ({
      authenticationData,
      login: saveAuthenticationData,
      logout,
    }),
    [authenticationData, saveAuthenticationData, logout]
  )
  return createElement(AuthContext.Provider, { value }, children)
}
