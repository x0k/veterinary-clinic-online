export interface SimpleCacheConfig<T> {
  enabled: boolean
  get: () => Promise<T | null>
  add: (value: T) => Promise<void>
}
