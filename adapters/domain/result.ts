export interface Ok<T> {
  ok: true
  value: T
}

export interface Err<E> {
  ok: false
  error: E
}

export type Result<T, E = Error> = Ok<T> | Err<E>

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok
}
