import { createContext, createElement, ReactNode, useContext } from 'react'
import { useQuery } from 'react-query'

import { queryKey } from '@/models/app'
import { User } from '@/models/user'
import { AuthenticationData } from '@/models/auth'

import { useAuthentication } from './auth'

const UserContext = createContext<User | null>(null)

export interface UserHandlers {
  fetchUser: (authData: AuthenticationData) => Promise<User | null>
}

export function useUser(): User | null {
  return useContext(UserContext)
}

export interface UserProviderProps {
  handlers: UserHandlers
  children: ReactNode
}

export function UserProvider({
  handlers,
  children,
}: UserProviderProps): JSX.Element {
  const { authenticationData } = useAuthentication()
  const { data } = useQuery(
    queryKey.user(authenticationData),
    ({ queryKey: [, data] }) => data && handlers.fetchUser(data),
    {
      initialData: null,
    }
  )
  const value = data ?? null
  return createElement(UserContext.Provider, { value }, children)
}
