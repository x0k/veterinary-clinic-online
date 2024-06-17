import { kv } from '@vercel/kv'

import type { KeyedCacheConfig } from '@/adapters/domain/cache'

export interface KeyedCacheConfigOptions {
  key: string
  expireTimeInSeconds: number
}

function assertField(x: unknown): asserts x is string | number {
  const t = typeof x
  if (t !== 'number' && t !== 'string') {
    throw new Error('field must be number or string')
  }
}

export function createKeyedCacheConfig<K, T>({
  key,
  expireTimeInSeconds,
}: KeyedCacheConfigOptions): KeyedCacheConfig<K, T> {
  return {
    async get(field) {
      assertField(field)
      return await kv.get(`${key}:${field.toString()}`)
    },
    async add(field, value) {
      assertField(field)
      await kv.set(`${key}:${field.toString()}`, value, {
        ex: expireTimeInSeconds,
      })
    },
  }
}
