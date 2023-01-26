import { AuthenticationData } from './auth'

export type UserId = string

export interface User {
  id: UserId
  name: string
  phone?: string
  email?: string
}

export interface IUserService {
  fetchUser: (authData: AuthenticationData) => Promise<User>
}
