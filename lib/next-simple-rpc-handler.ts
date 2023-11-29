import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'

import { isString } from '@/lib/guards'
import {
  type RPCConfig,
  SIMPLE_RPC_PROCEDURE_NAME_HTTP_HEADER,
} from '@/lib/simple-rpc'

export interface RPCHandlerContext<R> {
  request: NextApiRequest
  response: NextApiResponse<R>
}

export type RPCHandlers<Config extends RPCConfig<Config>> = {
  [P in keyof Config]: (
    ctx: RPCHandlerContext<Awaited<ReturnType<Config[P]>>>,
    ...params: Parameters<Config[P]>
  ) => ReturnType<Config[P]>
}

export function makeRPCHandler<Config extends RPCConfig<Config>>(
  handlers: RPCHandlers<Config>
): NextApiHandler {
  return async (request, response) => {
    const { headers, body, method } = request
    if (method !== 'POST') {
      response.status(422).send('Invalid HTTP method')
      return
    }
    const procedureName = headers[SIMPLE_RPC_PROCEDURE_NAME_HTTP_HEADER]
    if (!isString(procedureName) || !(procedureName in handlers)) {
      response.status(422).send('Invalid procedure name')
      return
    }
    const handler = handlers[procedureName as keyof Config]
    const ctx: RPCHandlerContext<Config[keyof Config]> = { request, response }
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const result = await handler(ctx, ...body)
      response.status(200).json(result)
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
