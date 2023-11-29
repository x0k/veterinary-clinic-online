import { type Brand } from '@/lib/type'
import { type DateData, type DateTimeData, type TimeData } from './common'

export type JSONTime = Brand<'JSONTime'>

export type JSONDate = Brand<'JSONDate'>

export type JSONDateTime = Brand<'JSONDateTime'>

export const JSON_DATE_FORMAT = 'yyyy-MM-dd'

function pad20(value: number): string {
  return String(value).padStart(2, '0')
}

export function dateDataToJSON({ year, month, date }: DateData): JSONDate {
  return `${year}-${pad20(month)}-${pad20(date)}` as JSONDate
}

export function timeDataToJSON({ hours, minutes }: TimeData): JSONTime {
  return `${pad20(hours)}:${pad20(minutes)}` as JSONTime
}

export function dateTimeDataToJSON(
  dateTime: DateTimeData,
  utcOffset = 'Z'
): JSONDateTime {
  return `${dateDataToJSON(dateTime)}T${timeDataToJSON(
    dateTime
  )}:00${utcOffset}` as JSONDateTime
}
