import { RPCClient } from '@/lib/axios-simple-rpc-client'
import { ClinicRPCConfig } from '@/models/clinic'
import { ClinicHandlers } from '@/domains/clinic'

export function makeClinicHandlers({
  call,
}: RPCClient<ClinicRPCConfig>): ClinicHandlers {
  return {
    fetchRecords: () => call('fetchActualRecords'),
    dismissRecord: (recordId) => call('dismissRecord', recordId),
  }
}
