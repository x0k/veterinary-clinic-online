import { IUserService } from '@/models/user'
import { UserHandlers } from '@/domains/user'

export function makeUserHandlers(userService: IUserService): UserHandlers {
  return {
    fetchUser: userService.fetchUser.bind(userService),
  }
}
