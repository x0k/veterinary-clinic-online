import { type RPCClient } from '@/lib/axios-simple-rpc-client'
import { type IUserService } from '@/models/user'
import { type UserHandlers } from '@/domains/user'

export function makeUserHandlers({
  call,
}: RPCClient<IUserService>): UserHandlers {
  return {
    fetchUser: () => call('fetchUserData'),
    logout: () => call('logout'),
  }
}
