import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { isErr, type AppConfig, type RootDomain } from '@/adapters/domain'

export async function createWasmDomain(config: AppConfig): Promise<RootDomain> {
  const go = new Go()
  const file = readFileSync(join(process.cwd(), 'public', 'domain.wasm'))
  const r = await WebAssembly.instantiate(file, go.importObject)
  void go.run(r.instance)
  const result = global.initRootDomain(config)
  if (isErr(result)) {
    return await Promise.reject(result.error)
  }
  return result.value
}
