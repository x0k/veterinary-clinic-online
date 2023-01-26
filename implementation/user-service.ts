import { getPerson } from '@/lib/google'
import { getUserInfo } from '@/lib/vk'
import {
  AbstractAuthenticationData,
  AuthenticationData,
  AuthenticationType,
} from '@/models/auth'
import { IUserService, User } from '@/models/user'

const USER_DATA_FACTORIES: {
  [T in AuthenticationType]: (
    data: Extract<AuthenticationData, AbstractAuthenticationData<T>>
  ) => Promise<User>
} = {
  [AuthenticationType.VK]: async ({ at: accessToken, em: email, id }) => {
    const user = await getUserInfo(accessToken)
    return {
      id,
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
      id: person.resourceName.slice(7),
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
  async fetchUser(authData: AuthenticationData): Promise<User> {
    return await USER_DATA_FACTORIES[authData.t](authData as never)
  }
}
