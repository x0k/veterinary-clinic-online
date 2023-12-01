import { initTRPC, TRPCError } from '@trpc/server'

import {
  clinicRecordCreateSchema,
  clinicRecordIdSchema,
  type IClinicService,
} from '@/models/clinic'
import type { IUserService } from '@/models/user'

import { auth } from '@/app/init-auth'

export interface RouterContext {
  clinicService: IClinicService
  userService: IUserService
}

const t = initTRPC.context<RouterContext>().create()

const withSession = t.middleware(async ({ ctx, next }) => {
  const session = await auth()
  return await next({ ctx: { ...ctx, session } })
})

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const session = await auth()
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return await next({ ctx: { ...ctx, session } })
})

const pub = t.procedure.use(withSession)
const priv = t.procedure.use(isAuthenticated)

export const appRouter = t.router({
  fetchUserData: pub.query(async ({ ctx }) => {
    return ctx.session && (await ctx.userService.fetchUserData(ctx.session))
  }),
  logout: priv.mutation(({ ctx }) => ctx.userService.logout()),
  fetchActualRecords: pub.query(async ({ ctx }) => {
    const userData =
      ctx.session && (await ctx.userService.fetchUserData(ctx.session))
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
