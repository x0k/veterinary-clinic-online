export type JSONPrimitive = string | number | boolean | null

export type JSONArray = JSONType[]

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JSONRecord {
  [k: string]: JSONType
}

export type JSONType = JSONArray | JSONRecord | JSONPrimitive

export interface StorageAccessor<T> {
  load: () => T
  save: (value: T) => void
  clear: () => void
}

export function makeStorageAccessor<T>(
  store: Storage,
  key: string,
  defaultValue: T
): StorageAccessor<T> {
  function load(): T {
    const storedValue = store.getItem(key)
    if (storedValue === null) {
      return defaultValue
    }
    try {
      const jsonValue = JSON.parse(storedValue)
      return jsonValue as T
    } catch {
      return defaultValue
    }
  }
  function save(value: T): void {
    store.setItem(key, JSON.stringify(value))
  }
  function clear(): void {
    store.removeItem(key)
  }
  return { load, save, clear }
}
