import { type RPCClient } from '@/lib/axios-simple-rpc-client'
import { type ClinicRPCConfig } from '@/models/clinic'
import { type ClinicHandlers } from '@/domains/clinic'

export function makeClinicHandlers({
  call,
}: RPCClient<ClinicRPCConfig>): ClinicHandlers {
  return {
    fetchRecords: () => call('fetchActualRecords'),
    dismissRecord: (recordId) => call('dismissRecord', recordId),
    createRecord: async (data) => {
      await call('createRecord', data)
    },
  }
}
