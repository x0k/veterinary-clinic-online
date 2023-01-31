import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useToast } from '@chakra-ui/react'

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
  const { data: userData, isLoading } = useQuery(
    queryKey.user,
    handlers.fetchUser
  )
  const queryClient = useQueryClient()
  const toast = useToast()
  const { mutate: logout } = useMutation(handlers.logout, {
    async onMutate() {
      await queryClient.cancelQueries(queryKey.user)
      const lastUser =
        queryClient.getQueryData<User | null>(queryKey.user) ?? null
      queryClient.setQueryData(queryKey.user, null)
      return { lastUser }
    },
    onError(error, _, context) {
      if (context) {
        queryClient.setQueryData(queryKey.clinicRecords, context.lastUser)
      }
      toast({
        status: 'error',
        title: 'Ошибка при выходе',
        description: error instanceof Error ? error.message : undefined,
      })
    },
    async onSettled() {
      await queryClient.invalidateQueries(queryKey.user)
    },
  })
  const value: User = useMemo(
    () =>
      isLoading
        ? { state: UserStatus.Invalidated }
        : userData
        ? {
            state: UserStatus.Authenticated,
            userData,
            logout,
          }
        : {
            state: UserStatus.Unauthenticated,
          },
    [isLoading, userData, logout]
  )
  return createElement(UserContext.Provider, { value }, children)
}
