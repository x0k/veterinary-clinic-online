export enum AuthenticationType {
  VK = 'vk',
  Google = 'google',
}

export const AUTHENTICATION_TYPES = Object.values(AuthenticationType)

function encode<T extends Record<string, string>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map((e) => [e[0], encodeURIComponent(e[1])])
  ) as T
}

export const AUTH_ENDPOINTS: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: 'https://accounts.google.com/o/oauth2/v2/auth',
  [AuthenticationType.VK]: 'https://oauth.vk.com/authorize',
}

export const AUTH_SCOPES: Record<AuthenticationType, string> = {
  [AuthenticationType.Google]: 'openid profile email',
  [AuthenticationType.VK]: 'email',
}

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
