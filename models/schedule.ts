import format from 'date-fns/format'

import { makePeriodsAPI, Period } from '@/lib/period'

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

export type TimePeriod = Period<TimeData>

export type DateTimePeriod = Period<DateTimeData>

export type JSONDate = string & { __brand: 'date' }

export enum DayType {
  Weekend = 1,
  Holiday = 2,
  PreHoliday = 3,
}

export type ProductionCalendarData = Record<JSONDate, DayType>

export type ProductionCalendar = Map<JSONDate, DayType>

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** From sunday[0] to saturday[6] */
export type OpeningHours = Partial<Record<WeekDay, TimePeriod>>

export type WorkBreakId = string

export interface WorkBreak {
  id: WorkBreakId
  title: string
  matchExpression: string
  period: TimePeriod
  dateFormat?: string
}

export type WorkBreaks = WorkBreak[]

export type BusyPeriods = DateTimePeriod[]

export interface DateTimePeriods {
  date: Date
  periods: TimePeriod[]
}

type DateTimePeriodsMapper = (data: DateTimePeriods) => DateTimePeriods

const { PRODUCTION_CALENDAR_URL: productionCalendarUrl } = process.env

export const PRODUCTION_CALENDAR_URL = productionCalendarUrl as string

export function makeProductionCalendarWithoutSaturdayWeekend(
  data: ProductionCalendarData
): ProductionCalendar {
  const entries = Object.entries(data) as Array<[JSONDate, DayType]>
  const entriesWithoutSaturdayWeekend = entries.filter(
    ([d, t]) => t !== DayType.Weekend || new Date(d).getDay() !== 6
  )
  return new Map(entriesWithoutSaturdayWeekend)
}

export interface FreePeriodsCalculatorConfig {
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
  busyPeriods: BusyPeriods
}

function compareTime(a: TimeData, b: TimeData): number {
  return a.hours - b.hours || a.minutes - b.minutes
}

function compareDate(a: DateData, b: DateData): number {
  return a.year - b.year || a.month - b.month || a.date - b.date
}

function compareDateTime(a: DateTimeData, b: DateTimeData): number {
  return compareDate(a, b) || compareTime(a, b)
}

const timePeriodsAPI = makePeriodsAPI({ compare: compareTime })
const dateTimePeriodsAPI = makePeriodsAPI({ compare: compareDateTime })

function makeTimeAdder({
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

function dataDataToJSONDate({ year, month, date }: DateData): JSONDate {
  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(
    2,
    '0'
  )}` as JSONDate
}

const DEFAULT_DATE_FORMAT = 'd YYYY-MM-DDTHH:mm:ss'

export function getTimePeriodDurationInMinutes({
  start,
  end,
}: TimePeriod): number {
  return (end.hours - start.hours) * 60 + (end.minutes - start.minutes)
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

function dateToDayDateTimePeriod(date: Date): DateTimePeriod {
  const dateData = dateToDateData(date)
  return {
    start: {
      ...dateData,
      hours: 0,
      minutes: 0,
    },
    end: {
      ...dateData,
      hours: 23,
      minutes: 59,
    },
  }
}

export function makeDayFreeTimePeriodsCalculator({
  openingHours,
  productionCalendar,
  busyPeriods,
  workBreaks,
}: FreePeriodsCalculatorConfig): (date: Date) => TimePeriod[] {
  const { subtractPeriodsFromPeriods, sortAndUnitePeriods, isValidPeriod } =
    timePeriodsAPI
  const getOpeningHours = (date: Date): DateTimePeriods => {
    const period = openingHours[date.getDay() as WeekDay]
    return {
      date,
      periods: period ? [period] : [],
    }
  }
  const applyProductionCalendar: DateTimePeriodsMapper = (data) => {
    const { date, periods } = data
    const dayType = productionCalendar.get(
      dataDataToJSONDate(dateToDateData(date))
    )
    switch (dayType) {
      case undefined:
        return data
      case DayType.Holiday:
      case DayType.Weekend:
        return { date, periods: [] }
      case DayType.PreHoliday: {
        if (periods.length < 1) {
          return data
        }
        const simplifiedPeriods = sortAndUnitePeriods(periods)
        const lastPeriodIndex = simplifiedPeriods.length - 1
        const lastPeriod = simplifiedPeriods[lastPeriodIndex]
        const reducedLastPeriod: TimePeriod = {
          start: lastPeriod.start,
          end: {
            hours: lastPeriod.end.hours - 1,
            minutes: lastPeriod.end.minutes,
          },
        }
        return isValidPeriod(reducedLastPeriod)
          ? {
              date,
              periods: periods.map((item, i) =>
                i === lastPeriodIndex ? reducedLastPeriod : item
              ),
            }
          : data
      }
      default:
        throw new TypeError(`Unknown day type: "${String(dayType)}"`)
    }
  }
  const applyWorkBreaks: DateTimePeriodsMapper = (data) => {
    const { date, periods } = data
    const defaultDate = format(date, DEFAULT_DATE_FORMAT)
    const breaks = workBreaks
      .filter(({ matchExpression, dateFormat }) =>
        new RegExp(matchExpression).test(
          dateFormat ? format(date, dateFormat) : defaultDate
        )
      )
      .map(({ period }) => period)
    return breaks.length
      ? {
          date,
          periods: sortAndUnitePeriods(
            subtractPeriodsFromPeriods(periods, breaks)
          ),
        }
      : data
  }
  const applyBusyPeriods: DateTimePeriodsMapper = (data) => {
    if (busyPeriods.length === 0) {
      return data
    }
    const { date, periods } = data
    const dayPeriod = dateToDayDateTimePeriod(date)
    const validBusyPeriods = busyPeriods
      .map((p) => dateTimePeriodsAPI.intersectPeriods(p, dayPeriod))
      .filter(dateTimePeriodsAPI.isValidPeriod)
    return validBusyPeriods.length
      ? {
          date,
          periods: sortAndUnitePeriods(
            subtractPeriodsFromPeriods(periods, validBusyPeriods)
          ),
        }
      : data
  }
  return (date: Date) =>
    applyBusyPeriods(
      applyWorkBreaks(applyProductionCalendar(getOpeningHours(date)))
    ).periods
}

export function makeFreeTimePeriodsWithDurationCalculator(
  duration: number
): (period: TimePeriod) => TimePeriod[] {
  const addDuration = makeTimeAdder({ minutes: duration })
  function getFreeTimePeriods(period: TimePeriod): TimePeriod[] {
    const { start, end } = period
    if (start.minutes > 0) {
      return getFreeTimePeriods({
        start: { hours: start.hours + 1, minutes: 0 },
        end,
      })
    }
    const periodDuration = getTimePeriodDurationInMinutes(period)
    if (periodDuration < duration) {
      return []
    }
    const freePeriod: TimePeriod = { start, end: addDuration(start) }
    return [freePeriod].concat(
      timePeriodsAPI
        .subtractPeriods(period, freePeriod)
        .flatMap(getFreeTimePeriods)
    )
  }
  return getFreeTimePeriods
}
