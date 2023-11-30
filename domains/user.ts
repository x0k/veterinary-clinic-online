import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@chakra-ui/react'

import { type User, UserStatus } from '@/models/user'

import { type createTRPCReact, getQueryKey } from '@trpc/react-query'
import type { AppRouter } from '@/implementation/trpc-server'

const UserContext = createContext<User>({
  state: UserStatus.Unauthenticated,
})

export function useUser(): User {
  return useContext(UserContext)
}

export interface UserProviderProps {
  children: ReactNode
  trpc: ReturnType<typeof createTRPCReact<AppRouter>>
}

export function UserProvider({
  children,
  trpc,
}: UserProviderProps): JSX.Element {
  const { data: userData, isLoading } = trpc.fetchUserData.useQuery()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { mutate: logout } = trpc.logout.useMutation({
    async onMutate() {
      const userKey = getQueryKey(trpc.fetchUserData)
      await queryClient.cancelQueries(userKey)
      const lastUser = queryClient.getQueryData<User | null>(userKey) ?? null
      queryClient.setQueryData(userKey, null)
      return { lastUser }
    },
    onError(error, _, context) {
      if (context) {
        queryClient.setQueryData(
          getQueryKey(trpc.fetchActualRecords),
          context.lastUser
        )
      }
      toast({
        status: 'error',
        title: 'Ошибка при выходе',
        description: error instanceof Error ? error.message : undefined,
      })
    },
    async onSettled() {
      await queryClient.invalidateQueries(getQueryKey(trpc.fetchUserData))
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
              logout: () => {
                logout()
              },
            }
          : {
              state: UserStatus.Unauthenticated,
            },
    [isLoading, userData, logout]
  )
  return createElement(UserContext.Provider, { value }, children)
}
