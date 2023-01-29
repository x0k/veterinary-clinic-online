import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { queryKey } from '@/models/app'
import { User, UserData, UserStatus } from '@/models/user'

const UserContext = createContext<User>({
  state: UserStatus.Unauthenticated,
})

export interface UserHandlers {
  fetchUser: () => Promise<UserData | null>
  logout: () => Promise<void>
}

export function useUser(): User {
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
  const { data: userData } = useQuery(queryKey.user, handlers.fetchUser, {
    initialData: null,
  })
  const queryClient = useQueryClient()
  const { mutate: logout } = useMutation(handlers.logout, {
    onSuccess() {
      queryClient.setQueryData(queryKey.user, null)
    },
  })
  const value: User = useMemo(
    () =>
      userData
        ? {
            state: UserStatus.Authenticated,
            userData,
            logout,
          }
        : {
            state: UserStatus.Unauthenticated,
          },
    [userData, logout]
  )
  return createElement(UserContext.Provider, { value }, children)
}
