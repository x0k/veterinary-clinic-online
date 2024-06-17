import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react'
import { signOut, useSession } from 'next-auth/react'

import { type User, UserStatus, type UserData } from '@/shared/user'

const UserContext = createContext<User>({
  state: UserStatus.Unauthenticated,
})

export function useUser(): User {
  return useContext(UserContext)
}

export interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const session = useSession()
  const value: User = useMemo(
    () =>
      session.status === 'loading'
        ? { state: UserStatus.Invalidated }
        : session.data?.user
          ? {
              state: UserStatus.Authenticated,
              userData: session.data.user as UserData,
              logout: () => {
                void signOut()
              },
            }
          : {
              state: UserStatus.Unauthenticated,
            },
    [session.data?.user, session.status]
  )
  return createElement(UserContext.Provider, { value }, children)
}
