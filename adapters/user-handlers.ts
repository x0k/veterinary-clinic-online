import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { IUserService } from '@/models/user'
import { ApiRoutes } from '@/models/app'
import { UserHandlers } from '@/domains/user'

const call = makeRPCClient<IUserService>(ApiRoutes.User)

export function makeUserHandlers(): UserHandlers {
  return {
    fetchUser: () => call('fetchUserData'),
    logout: () => call('logout'),
  }
}
