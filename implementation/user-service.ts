import { getPerson } from '@/lib/google'
import { getUserInfo } from '@/lib/vk'
import {
  AbstractAuthenticationData,
  AuthenticationData,
  AuthenticationType,
  IAuthenticationService,
} from '@/models/auth'
import { IUserService, UserData, UserId } from '@/models/user'

const USER_DATA_FACTORIES: {
  [T in AuthenticationType]: (
    data: Extract<AuthenticationData, AbstractAuthenticationData<T>>
  ) => Promise<UserData>
} = {
  [AuthenticationType.VK]: async ({ at: accessToken, em: email, id }) => {
    const user = await getUserInfo(accessToken)
    return {
      id: id as UserId,
      name: `${user.last_name} ${user.first_name}`,
      email,
      phone:
        user.contacts?.mobile_phone ??
        user.contacts?.home_phone ??
        user.home_phone,
    }
  },
  [AuthenticationType.Google]: async ({ at: accessToken }) => {
    const person = await getPerson(accessToken)
    return {
      id: person.resourceName.slice(7) as UserId,
      email: person.emailAddresses.find((e) => e.metadata.primary)?.value,
      name:
        person.names.length > 0
          ? `${person.names[0].familyName} ${person.names[0].givenName}`
          : person.resourceName,
      phone:
        person.phoneNumbers?.find((p) => p.metadata.primary)?.value ??
        person.phoneNumbers?.[0].value,
    }
  },
}

export class UserService implements IUserService {
  constructor(private readonly authService: IAuthenticationService) {}

  async fetchUserData(): Promise<UserData | null> {
    const authData = await this.authService.loadAuthenticationData()
    return (
      authData && (await USER_DATA_FACTORIES[authData.t](authData as never))
    )
  }

  async logout(): Promise<void> {
    await this.authService.clearAuthenticationData()
  }
}
