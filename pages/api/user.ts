import { makeRPCHandler } from '@/lib/next-simple-rpc-handler'
import { type IUserService } from '@/models/user'
import { AuthenticationService } from '@/implementation/next-api-authentication-service'
import { UserService } from '@/implementation/user-service'

export default makeRPCHandler<IUserService>({
  fetchUserData: (ctx) => {
    const userService = new UserService(
      new AuthenticationService(ctx.request, ctx.response)
    )
    return userService.fetchUserData()
  },
  logout: (ctx) => {
    const userService = new UserService(
      new AuthenticationService(ctx.request, ctx.response)
    )
    return userService.logout()
  },
})
