export enum AuthenticationType {
  VK = 'vk',
  Google = 'google',
}

export const AUTHENTICATION_TYPES = Object.values(AuthenticationType)

export const AUTH_SCOPES: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: 'openid profile email',
  [AuthenticationType.VK]: 'email',
}
