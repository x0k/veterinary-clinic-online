import { kv } from '@vercel/kv'

import type { SimpleCacheConfig } from '@/adapters/domain/cache'

export interface SimpleCacheConfigOptions {
  key: string
  expireTimeInSeconds: number
}

export function createSimpleCacheConfig<T>({
  key,
  expireTimeInSeconds,
}: SimpleCacheConfigOptions): SimpleCacheConfig<T> {
  return {
    get(): Promise<T | null> {
      return kv.get(key)
    },
    async add(value) {
      await kv.set(key, value, {
        ex: expireTimeInSeconds,
      })
    },
  }
}
