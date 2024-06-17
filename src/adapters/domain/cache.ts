export interface SimpleCacheConfig<T> {
  get: () => Promise<T | null>
  add: (value: T) => Promise<void>
}

export interface KeyedCacheConfig<K, T> {
  get: (key: K) => Promise<T | null>
  add: (key: K, value: T) => Promise<void>
}
