import { Brand } from '@/lib/type'

export type UserId = Brand<'userId'>

export interface UserData {
  id: UserId
  name: string
  phone?: string
  email?: string
}

export enum UserStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

export interface AbstractUser<S extends UserStatus> {
  state: S
}

export interface AuthenticatedUser
  extends AbstractUser<UserStatus.Authenticated> {
  userData: UserData
  logout: () => void
}

export interface UnauthenticatedUser
  extends AbstractUser<UserStatus.Unauthenticated> {}

export type User = AuthenticatedUser | UnauthenticatedUser

export interface IUserService {
  fetchUserData: () => Promise<UserData | null>
  logout: () => Promise<void>
}

export function isUserAuthenticated(user: User): user is AuthenticatedUser {
  return user.state === UserStatus.Authenticated
}
