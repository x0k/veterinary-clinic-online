export type JSONTime = string & { __brand: 'time' }

export type JSONDate = string & { __brand: 'date' }

export type JSONDateTime = string & { __brand: 'dateTime' }

export type Period<T> = [T, T]

export type JSONTimePeriod = Period<JSONTime>

export type JSONDateTimePeriod = Period<JSONDateTime>

export enum DayType {
  Weekend = 1,
  Holiday = 2,
  PreHoliday = 3,
}

export type ProductionCalendarData = Record<JSONDate, DayType>

export type ProductionCalendar = Map<JSONDate, DayType>

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** From sunday to saturday */
export type OpeningHours = JSONDateTimePeriod[][]

const { PRODUCTION_CALENDAR_URL: productionCalendarUrl } = process.env

export const PRODUCTION_CALENDAR_URL = productionCalendarUrl as string

export function makeProductionCalendar(
  data: ProductionCalendarData
): ProductionCalendar {
  return new Map(Object.entries(data) as Array<[JSONDate, DayType]>)
}

export interface FreePeriodsCalculatorConfig {
  productionCalendar: ProductionCalendar
}

export function makeFreePeriodsCalculator({
  productionCalendar,
}: FreePeriodsCalculatorConfig): () => Period[] {
  return (date: JSONDate, busyPeriods: Period[]) => {}
}
