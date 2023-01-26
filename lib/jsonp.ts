import jsonp from 'jsonp'

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function fetchJSONP<T>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) =>
    jsonp(url, (error, data) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(data)
      }
    })
  )
}
