import { isRecord, isString } from '@/lib/guards'

export enum AuthenticationType {
  VK = 'vk',
  Google = 'ggl',
}

export const AUTHENTICATION_TYPES = Object.values(AuthenticationType)

export interface AbstractAuthenticationData<T extends AuthenticationType> {
  /** type */
  t: T
  /** access token */
  at: string
}

export interface VKAuthenticationData
  extends AbstractAuthenticationData<AuthenticationType.VK> {
  /** expiries in */
  ei: number
  /** email */
  em: string
  /** user id */
  id: string
}

export interface GoogleAuthenticationData
  extends AbstractAuthenticationData<AuthenticationType.Google> {
  /** expiries in */
  ei: number
}

export type AuthenticationData = VKAuthenticationData | GoogleAuthenticationData

export interface VKSuccessAuthenticationResponse {
  access_token: string
  expires_in: number
  user_id: number
  email: string
}

export interface VKErrorAuthenticationResponse {
  error: string
  error_description: string
}

export interface GoogleSuccessAuthenticationResponse {
  token_type: 'Bearer'
  access_token: string
  expires_in: number
  refresh_token: string
}

export interface GoogleErrorAuthenticationResponse {
  error: string
}

export interface SuccessAuthenticationResponses {
  [AuthenticationType.Google]: GoogleSuccessAuthenticationResponse
  [AuthenticationType.VK]: VKSuccessAuthenticationResponse
}

export interface ErrorAuthenticationResponses {
  [AuthenticationType.Google]: GoogleErrorAuthenticationResponse
  [AuthenticationType.VK]: VKErrorAuthenticationResponse
}

export interface Authentication {
  authenticationData: AuthenticationData | null
  login: <T extends AuthenticationType>(
    data: SuccessAuthenticationResponses[T]
  ) => void
  logout: () => void
}

export interface IAuthenticationService {
  authenticate: <T extends AuthenticationType>(
    type: T,
    code: string
  ) => Promise<void>
  loadAuthenticationData: () => Promise<AuthenticationData | null>
  clearAuthenticationData: () => Promise<void>
}

export const AUTHENTICATION_TYPE_QUERY_KEY = 'auth_type'

export const AUTHENTICATION_ERROR_QUERY_KEY = 'auth_error'

export const AUTHENTICATION_COOKIE_KEY = 'auth'

function encode<T extends Record<string, string>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map((e) => [e[0], encodeURIComponent(e[1])])
  ) as T
}

export const AUTH_ENDPOINTS: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: 'https://accounts.google.com/o/oauth2/v2/auth',
  [AuthenticationType.VK]: 'https://oauth.vk.com/authorize',
}

export const AUTH_SCOPES: Record<AuthenticationType, string> = encode({
  [AuthenticationType.Google]:
    'https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/userinfo.email',
  [AuthenticationType.VK]: 'email',
})

export const REDIRECT_ORIGIN = process.env.NEXT_PUBLIC_REDIRECT_ORIGIN

export const REDIRECT_URL = encodeURIComponent(
  `${REDIRECT_ORIGIN}/api/callback`
)

export const CLIENTS_ID: Record<AuthenticationType, string> = encode({
  [AuthenticationType.Google]: process.env
    .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
  [AuthenticationType.VK]: process.env.NEXT_PUBLIC_VK_CLIENT_ID as string,
})

export const ACCESS_TOKEN_ENDPOINTS: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: 'https://oauth2.googleapis.com/token',
  [AuthenticationType.VK]: 'https://oauth.vk.com/access_token',
}

export const CLIENTS_SECRET: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: process.env.GOOGLE_CLIENT_SECRET as string,
  [AuthenticationType.VK]: process.env.VK_CLIENT_SECRET as string,
}

export function isAuthenticationType<T extends AuthenticationType>(
  value: any
): value is T {
  return AUTHENTICATION_TYPES.includes(value as AuthenticationType)
}

export const SUCCESS_AUTHENTICATION_RESPONSE_VALIDATORS: {
  [T in AuthenticationType]: (
    data: unknown
  ) => data is SuccessAuthenticationResponses[T]
} = {
  [AuthenticationType.Google]: (
    data
  ): data is GoogleSuccessAuthenticationResponse =>
    isRecord(data) &&
    data.state === AuthenticationType.Google &&
    data.token_type === 'Bearer' &&
    isString(data.access_token) &&
    isString(data.expires_in),
  [AuthenticationType.VK]: (data): data is VKSuccessAuthenticationResponse =>
    isRecord(data) &&
    data.state === AuthenticationType.VK &&
    isString(data.access_token) &&
    isString(data.expires_in) &&
    isString(data.user_id) &&
    isString(data.email),
}

export function isErrorAuthenticationResponse(
  data: unknown
): data is ErrorAuthenticationResponses[AuthenticationType] {
  return (
    isRecord(data) &&
    isString(data) &&
    (!('error_description' in data) || isString(data.error_description))
  )
}

export function makeAuthenticationLink(type: AuthenticationType): string {
  return `${AUTH_ENDPOINTS[type]}?client_id=${CLIENTS_ID[type]}&redirect_uri=${REDIRECT_URL}&scope=${AUTH_SCOPES[type]}&response_type=code&state=${type}`
}
