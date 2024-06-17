import type { appRouter } from './server'

export type AppRouter = typeof appRouter

export enum ApiRoute {
  TRPC = '/api/trpc',
}
