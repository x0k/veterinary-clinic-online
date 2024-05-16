import { add } from 'date-fns/add'
import { z } from 'zod'

export const timeDataSchema = z.object({
  minutes: z.number(),
  hours: z.number(),
})

export interface TimeData {
  minutes: number
  hours: number
}

export const dateDataSchema = z.object({
  days: z.number(),
  month: z.number(),
  year: z.number(),
})

export interface DateData {
  year: number
  month: number
  days: number
}

export const DateTimeDataSchema = z.intersection(dateDataSchema, timeDataSchema)

export type DateTimeData = DateData & TimeData

export function compareTime(a: TimeData, b: TimeData): number {
  return a.hours - b.hours || a.minutes - b.minutes
}

export function compareDate(a: DateData, b: DateData): number {
  return a.year - b.year || a.month - b.month || a.days - b.days
}

export function compareDateTime(a: DateTimeData, b: DateTimeData): number {
  return compareDate(a, b) || compareTime(a, b)
}

export function makeTimeShifter({
  hours = 0,
  minutes = 0,
}: Partial<TimeData>): (time: TimeData) => TimeData {
  return (time) => {
    const totalMinutes = time.minutes + minutes
    const additionalHours = (totalMinutes > 0 ? Math.floor : Math.ceil)(
      totalMinutes / 60
    )
    return {
      hours: time.hours + hours + additionalHours,
      minutes: totalMinutes - additionalHours * 60,
    }
  }
}

export function makeDateTimeShifter(
  duration: Partial<DateTimeData>
): (data: DateTimeData) => DateTimeData {
  return (data) => {
    const d = dateTimeDataToDate(data)
    return dateToDateTimeData(add(d, duration))
  }
}

export function dateToDateData(date: Date): DateData {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    days: date.getDate(),
  }
}

export function dateToTimeData(date: Date): TimeData {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
  }
}

export function dateToDateTimeData(date: Date): DateTimeData {
  return Object.assign(dateToDateData(date), dateToTimeData(date))
}

export function dateTimeDataToDate({
  year,
  month,
  days: date,
  hours,
  minutes,
}: DateTimeData): Date {
  return new Date(year, month - 1, date, hours, minutes)
}

export function formatDateWithLocal(date: Date): string {
  return date.toLocaleString('ru', { dateStyle: 'long', timeStyle: 'short' })
}

export function formatShortDateWithLocal(date: Date): string {
  return date.toLocaleDateString('ru')
}
