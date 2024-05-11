import { initTRPC, TRPCError } from '@trpc/server'

import { type IClinicService } from '@/models/clinic'

import { auth } from '@/app/init-auth'
import { recordSchema } from '@/adapters/backend'

export interface RouterContext {
  clinicService: IClinicService
}

const t = initTRPC.context<RouterContext>().create()

const withSession = t.middleware(async ({ ctx, next }) => {
  const session = await auth()
  return await next({ ctx: { ...ctx, session } })
})

const withAuthentication = t.middleware(async ({ ctx, next }) => {
  const session = await auth()
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  const user = session.user
  if (!user) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
  const userId = user.id
  if (!userId) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
  return await next({ ctx: { ...ctx, session, user, userId } })
})

const pub = t.procedure.use(withSession)
const priv = t.procedure.use(withAuthentication)

export const appRouter = t.router({
  // fetchActualRecords: pub.query(async ({ ctx }) => {
  //   return await ctx.clinicService.fetchActualRecords(
  //     ctx.session?.user?.id as UserId
  //   )
  // }),
  // createRecord: priv
  //   .input(clinicRecordCreateSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.clinicService.createRecord(ctx.userId as UserId, input)
  //   }),
  // dismissRecord: priv
  //   .input(clinicRecordIdSchema)
  //   .mutation(({ ctx, input }) =>
  //     ctx.clinicService.removeRecord(ctx.userId as UserId, input)
  //   ),
  createRecord: priv.input(recordSchema).mutation(async ({ ctx, input }) => {}),
})

export type AppRouter = typeof appRouter
