import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { isErr, type AppConfig, type RootDomain } from '@/adapters/domain'

import '@/vendor/wasm_exec.js'

const proc = globalThis.process

const proxyProcess = new Proxy(
  {},
  {
    get(_, property) {
      if (property === 'argv0') {
        return 'web'
      }
      const val = proc[property as keyof typeof proc]
      if (typeof val === 'function') {
        return val.bind(proc)
      }
      return val
    },
    set(_, property, value) {
      return Reflect.set(proc, property, value)
    },
    has(_, p) {
      return Reflect.has(proc, p)
    },
    ownKeys() {
      return Reflect.ownKeys(proc)
    },
    getOwnPropertyDescriptor(_, property) {
      return Reflect.getOwnPropertyDescriptor(proc, property)
    },
    deleteProperty(target, p) {
      return Reflect.deleteProperty(target, p)
    },
    defineProperty(target, p, attributes) {
      return Reflect.defineProperty(target, p, attributes)
    },
  }
)

const proxyGlobalThis = new Proxy(globalThis, {
  get(target, property) {
    if (property === 'process') {
      return proxyProcess
    }
    const val = target[property as keyof typeof target]
    if (typeof val === 'function') {
      return val.bind(target)
    }
    return val
  },
})

class PatchedGo extends Go {
  private __values: any[] = []

  get _values(): any[] {
    return this.__values
  }

  set _values(v) {
    this.__values = v
    this.__values[5] = proxyGlobalThis
  }

  private __ids = new Map<any, number>()

  get _ids(): Map<any, number> {
    return this.__ids
  }

  set _ids(v) {
    this.__ids = v
    this.__ids.set(proxyGlobalThis, 5)
  }
}

export async function createWasmDomain(config: AppConfig): Promise<RootDomain> {
  const go = new PatchedGo()
  const file = readFileSync(join(process.cwd(), 'public', 'domain.wasm'))
  const r = await WebAssembly.instantiate(file, go.importObject)
  void go.run(r.instance)
  const result = global.initRootDomain(config)
  if (isErr(result)) {
    return await Promise.reject(result.error)
  }
  return result.value
}
