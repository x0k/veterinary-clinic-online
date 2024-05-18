import type { Session } from 'next-auth'

import { type Brand } from '@/lib/type'

export type UserId = Brand<'userId'>

export interface UserData {
  id: UserId
  name: string
  phone?: string
  email?: string
}

export enum UserStatus {
  Authenticated = 'authenticated',
  Invalidated = 'invalidated',
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

export interface InvalidatedUser extends AbstractUser<UserStatus.Invalidated> {}

export interface UnauthenticatedUser
  extends AbstractUser<UserStatus.Unauthenticated> {}

export type User = AuthenticatedUser | InvalidatedUser | UnauthenticatedUser

export interface IUserService {
  fetchUserData: (session: Session) => Promise<UserData>
  logout: () => Promise<void>
}

export function isAuthenticatedUser(user: User): user is AuthenticatedUser {
  return user.state === UserStatus.Authenticated
}

export function isUnauthenticatedUser(user: User): user is UnauthenticatedUser {
  return user.state === UserStatus.Unauthenticated
}

export function isInvalidatedUser(user: User): user is InvalidatedUser {
  return user.state === UserStatus.Invalidated
}
