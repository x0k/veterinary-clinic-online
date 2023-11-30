import {
  clinicRecordCreateSchema,
  clinicRecordIdSchema,
  type IClinicService,
} from '@/models/clinic'
import type { IUserService } from '@/models/user'
import { initTRPC } from '@trpc/server'

export interface RouterContext {
  clinicService: IClinicService
  userService: IUserService
}

const t = initTRPC.context<RouterContext>().create()

// this is our RPC API
export const appRouter = t.router({
  fetchUserData: t.procedure.query(({ ctx }) =>
    ctx.userService.fetchUserData()
  ),
  logout: t.procedure.mutation(({ ctx }) => ctx.userService.logout()),
  fetchActualRecords: t.procedure.query(async ({ ctx }) => {
    const userData = await ctx.userService.fetchUserData()
    return await ctx.clinicService.fetchActualRecords(userData?.id)
  }),
  createRecord: t.procedure
    .input(clinicRecordCreateSchema)
    .mutation(({ ctx, input }) => ctx.clinicService.createRecord(input)),
  dismissRecord: t.procedure
    .input(clinicRecordIdSchema)
    .mutation(({ ctx, input }) => ctx.clinicService.removeRecord(input)),
})

export type AppRouter = typeof appRouter
