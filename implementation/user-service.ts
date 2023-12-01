import { type Session } from 'next-auth'

import { getPerson } from '@/lib/google'
import { getUserInfo } from '@/lib/vk'
import {
  type AbstractAuthenticationData,
  type AuthenticationData,
  AuthenticationType,
} from '@/models/auth'
import { type IUserService, type UserData, type UserId } from '@/models/user'

import { signOut } from '@/app/init-auth'

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
  async fetchUserData(session: Session): Promise<UserData> {
    console.log(JSON.stringify(session))
    return session.user as UserData
    // return await USER_DATA_FACTORIES[session.t](session as never)
  }

  async logout(): Promise<void> {
    await signOut()
  }
}
