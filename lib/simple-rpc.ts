export type RPCConfig<Config> = { [K in keyof Config]: (...args: any) => any }

export const SIMPLE_RPC_PROCEDURE_NAME_HTTP_HEADER = 'simple_rpc_proc_name'
