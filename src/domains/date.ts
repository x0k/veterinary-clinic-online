export interface Time {
  hours: number
  minutes: number
}

export interface DomainDate {
  year: number
  month: number
  day: number
}

export interface DateTime {
  date: DomainDate
  time: Time
}

export function compareDomainDate(a: DomainDate, b: DomainDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day
}

export function dateTimeToDate(
  dateTime: DateTime
): Date {
  return new Date(
    dateTime.date.year,
    dateTime.date.month - 1,
    dateTime.date.day,
    dateTime.time.hours,
    dateTime.time.minutes
  )
}

export function durationInMinutes(
  start: Time,
  end: Time,
): number {
  return (end.hours - start.hours) * 60 + (end.minutes - start.minutes)
}

function pad20(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatTime(time: Time): string {
  return `${pad20(time.hours)}:${pad20(time.minutes)}`
}

export type FormattedDate = string

export function formatDate(date: Date): FormattedDate {
  return `${date.getFullYear()}-${pad20(date.getMonth() + 1)}-${pad20(date.getDate())}`
}

export function toIsoDate(date: string): string {
  const dt = new Date(date)
  // dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString()
}

export function formatDateWithLocal(date: Date): string {
  return date.toLocaleString('ru', { dateStyle: 'long', timeStyle: 'short' })
}

export function formatShortDateWithLocal(date: Date): string {
  return date.toLocaleDateString('ru')
}

