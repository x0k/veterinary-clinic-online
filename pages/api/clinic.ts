import { Client as NotionClient } from '@notionhq/client'

import { makeRPCHandler } from '@/lib/next-simple-rpc-handler'
import { type ClinicRPCConfig } from '@/models/clinic'
import { NOTION_AUTH } from '@/models/notion'
import { ClinicService } from '@/implementation/clinic-service'
import { AuthenticationService } from '@/implementation/authentication-service'
import { UserService } from '@/implementation/user-service'

const clinicService = new ClinicService(new NotionClient({ auth: NOTION_AUTH }))

export default makeRPCHandler<ClinicRPCConfig>({
  fetchActualRecords: async (ctx) => {
    const userService = new UserService(
      new AuthenticationService(ctx.request, ctx.response)
    )
    const userData = await userService.fetchUserData()
    return await clinicService.fetchActualRecords(userData?.id)
  },
  createRecord: async (ctx, data) => {
    return await clinicService.createRecord(data)
  },
  dismissRecord: async (ctx, recordId) => {
    await clinicService.removeRecord(recordId)
  },
})
