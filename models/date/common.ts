import add from 'date-fns/add'

export interface TimeData {
  minutes: number
  hours: number
}

export interface DateData {
  year: number
  month: number
  date: number
}

export type DateTimeData = DateData & TimeData

export function compareTime(a: TimeData, b: TimeData): number {
  return a.hours - b.hours || a.minutes - b.minutes
}

export function compareDate(a: DateData, b: DateData): number {
  return a.year - b.year || a.month - b.month || a.date - b.date
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
    date: date.getDate(),
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
  date,
  hours,
  minutes,
}: DateTimeData): Date {
  return new Date(year, month - 1, date, hours, minutes)
}

export function formatDate(date: Date): string {
  return date.toLocaleString('ru', { dateStyle: 'long', timeStyle: 'short' })
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('ru')
}
