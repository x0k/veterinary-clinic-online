import { type Result } from './result'

export interface TimeDTO {
  minutes: number
  hours: number
}

export interface DateDTO {
  day: number
  month: number
  year: number
}

export interface DateTimeDTO {
  date: DateDTO
  time: TimeDTO
}

export interface PeriodDTO<T> {
  start: T
  end: T
}

export interface SharedDomain {
  timePeriodDurationInMinutes: (
    timePeriod: PeriodDTO<TimeDTO>
  ) => Result<number>
  isDateTimePeriodIntersectWithPeriods: (
    period: PeriodDTO<DateTimeDTO>,
    ...periods: Array<PeriodDTO<DateTimeDTO>>
  ) => Result<boolean>
}
