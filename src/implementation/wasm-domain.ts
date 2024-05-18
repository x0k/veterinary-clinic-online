import { isErr, type AppConfig, type RootDomain } from '@/adapters/domain'

// @ts-expect-error wasm
import domainWasm from '@/vendor/domain.wasm?module'

export async function createWasmDomain(config: AppConfig): Promise<RootDomain> {
  const go = new Go()
  const instance = await WebAssembly.instantiate(
    domainWasm as WebAssembly.Module,
    go.importObject
  )
  void go.run(instance)
  const result = global.initRootDomain(config)
  if (isErr(result)) {
    return await Promise.reject(result.error)
  }
  return result.value
}
