import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { ApiRoutes } from '@/models/app'
import { ClinicRPCConfig } from '@/models/clinic'
import { ClinicHandlers } from '@/domains/clinic'

const call = makeRPCClient<ClinicRPCConfig>(ApiRoutes.Clinic)

export function makeClinicHandlers(): ClinicHandlers {
  return {
    fetchRecords: call.bind(undefined, 'fetchRecords'),
  }
}
