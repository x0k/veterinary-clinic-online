export enum AppRoute {
  Home = '/',
  Info = '/info',
  Services = '/services',
  Privacy = '/privacy',
}

export const APP_ROUTES = Object.values(AppRoute)

export enum ApiRoute {
  Clinic = '/api/clinic',
  User = '/api/user',
  TRPC = '/api/trpc',
}

export const API_ROUTS = Object.values(ApiRoute)

export const queryKey = {
  user: ['user'],
  clinicRecords: ['clinicRecords'],
}

export const SERVICES_REVALIDATE_INTERVAL = 24 * 60 * 60
export const CALENDAR_REVALIDATE_INTERVAL = 30 * 24 * 60 * 60
