import { initTRPC, TRPCError } from '@trpc/server'

import {
  clinicRecordCreateSchema,
  clinicRecordIdSchema,
  type IClinicService,
} from '@/models/clinic'
import type { UserId } from '@/models/user'

import { auth } from '@/app/init-auth'

export interface RouterContext {
  clinicService: IClinicService
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
  fetchActualRecords: pub.query(async ({ ctx }) => {
    return await ctx.clinicService.fetchActualRecords(
      ctx.session?.user?.id as UserId
    )
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
