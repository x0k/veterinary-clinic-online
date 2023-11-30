import { initTRPC, TRPCError } from '@trpc/server'

import {
  clinicRecordCreateSchema,
  clinicRecordIdSchema,
  type IClinicService,
} from '@/models/clinic'
import type { AuthenticationData, IAuthenticationService } from '@/models/auth'
import type { IUserService } from '@/models/user'

export interface RouterContext {
  clinicService: IClinicService
  authService: IAuthenticationService
  userService: IUserService
  authData?: AuthenticationData
}

const t = initTRPC.context<RouterContext>().create()

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const authData = await ctx.authService.loadAuthenticationData()
  if (!authData) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return await next({ ctx: { ...ctx, authData } })
})

const pub = t.procedure
const priv = t.procedure.use(isAuthenticated)

export const appRouter = t.router({
  fetchUserData: pub.query(({ ctx }) => ctx.userService.fetchUserData()),
  logout: priv.mutation(({ ctx }) => ctx.userService.logout()),
  fetchActualRecords: pub.query(async ({ ctx }) => {
    const userData = await ctx.userService.fetchUserData()
    return await ctx.clinicService.fetchActualRecords(userData?.id)
  }),
  createRecord: priv
    .input(clinicRecordCreateSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.clinicService.createRecord(input)
    }),
  dismissRecord: priv
    .input(clinicRecordIdSchema)
    .mutation(({ ctx, input }) => ctx.clinicService.removeRecord(input)),
})

export type AppRouter = typeof appRouter
