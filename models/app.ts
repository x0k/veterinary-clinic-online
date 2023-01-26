import { AuthenticationData } from './auth'

export enum AppRoute {
  Home = '/',
  Info = '/info',
  Services = '/services',
}

export const APP_ROUTES = Object.values(AppRoute)

export const queryKey = {
  auth: 'auth',
  user: (data: AuthenticationData | null) => ['user', data] as const,
  info: 'info',
  services: (pageId: string) => ['services', pageId] as const,
}
