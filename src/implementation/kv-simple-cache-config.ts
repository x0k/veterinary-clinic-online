import { kv } from '@vercel/kv'

import { type SimpleCacheConfig } from '@/adapters/domain/cache'

export interface SimpleCacheConfigOptions {
  key: string
  expireTimeInSeconds: number
  enabled: boolean
}

export function createSimpleCacheConfig<T>({
  key,
  enabled,
  expireTimeInSeconds,
}: SimpleCacheConfigOptions): SimpleCacheConfig<T> {
  return {
    enabled,
    get(): Promise<T | null> {
      return kv.get<T>(key)
    },
    async add(value) {
      await kv.set(key, value, {
        ex: expireTimeInSeconds,
      })
    },
  }
}
