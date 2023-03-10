import axios from 'axios'

import {
  RPCConfig,
  SIMPLE_RPC_PROCEDURE_NAME_HTTP_HEADER,
} from '@/lib/simple-rpc'

export interface RPCClient<Config extends RPCConfig<Config>> {
  call: <P extends keyof Config & string>(
    procedureName: P,
    ...params: Parameters<Config[P]>
  ) => Promise<Awaited<ReturnType<Config[P]>>>
}

export function makeRPCClient<Config extends RPCConfig<Config>>(
  url: string
): RPCClient<Config> {
  async function call<P extends keyof Config & string>(
    procedureName: P,
    ...params: Parameters<Config[P]>
  ): Promise<Awaited<ReturnType<Config[P]>>> {
    const { data } = await axios.post<Awaited<ReturnType<Config[P]>>>(
      url,
      params,
      {
        headers: {
          [SIMPLE_RPC_PROCEDURE_NAME_HTTP_HEADER]: procedureName,
        },
      }
    )
    return data
  }
  return { call }
}
