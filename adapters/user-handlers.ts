import { RPCClient } from '@/lib/axios-simple-rpc-client'
import { IUserService } from '@/models/user'
import { UserHandlers } from '@/domains/user'

export function makeUserHandlers({
  call,
}: RPCClient<IUserService>): UserHandlers {
  return {
    fetchUser: () => call('fetchUserData'),
    logout: () => call('logout'),
  }
}
