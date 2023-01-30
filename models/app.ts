export enum AppRoute {
  Home = '/',
  Info = '/info',
  Services = '/services',
  Privacy = '/privacy'
}

export const APP_ROUTES = Object.values(AppRoute)

export enum ApiRoutes {
  Clinic = '/api/clinic',
  User = '/api/user',
}

export const API_ROUTS = Object.values(ApiRoutes)

export const queryKey = {
  user: 'user',
  clinicRecords: 'clinicRecords',
}

export const PAGE_REVALIDATE_INTERVAL = 24 * 60 * 60
