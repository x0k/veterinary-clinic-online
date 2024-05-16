import { initTRPC, TRPCError } from '@trpc/server'

import {
  createCustomerSchema,
  createAppointmentSchema,
  freeTimeSlotsQuery,
  isoDateSchema,
} from '@/adapters/trpc'
import { type RootDomain } from '@/adapters/domain'
import { auth } from '@/auth'

export interface RouterContext {
  root: RootDomain
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
  dayOrNextWorkingDay: pub
    .input(isoDateSchema)
    .query(({ ctx, input }) => ctx.root.appointment.dayOrNextWorkingDay(input)),
  schedule: pub
    .input(isoDateSchema)
    .query(({ ctx, input }) => ctx.root.appointment.schedule(input)),
  actualRecord: priv.query(async ({ ctx }) => {
    return await ctx.root.appointment.activeAppointment(ctx.userId)
  }),
  cancelAppointment: priv.mutation(({ ctx }) =>
    ctx.root.appointment.cancelAppointment(ctx.userId)
  ),
  upsertCustomer: priv.input(createCustomerSchema).mutation(({ ctx, input }) =>
    ctx.root.appointment.upsertCustomer({
      ...input,
      identity: ctx.userId,
    })
  ),
  services: priv.query(({ ctx }) => ctx.root.appointment.services()),
  freeTimeSlots: priv
    .input(freeTimeSlotsQuery)
    .query(({ ctx, input }) =>
      ctx.root.appointment.freeTimeSlots(input.serviceId, input.appointmentDate)
    ),
  createAppointment: priv
    .input(createAppointmentSchema)
    .mutation(({ ctx, input }) =>
      ctx.root.appointment.createAppointment(
        input.appointmentDate,
        ctx.userId,
        input.serviceId
      )
    ),
})
