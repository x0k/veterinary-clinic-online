import { format } from 'date-fns/format'

import {
  type JSONDate,
  type TimePeriod,
  type DateTimePeriod,
  dateToDateData,
  type DateTimeData,
  timePeriodsAPI,
  dateDataToJSON,
  compareDate,
  dateTimePeriodsAPI,
  makeTimeShifter,
  getTimePeriodDurationInMinutes,
  type DateData,
} from './date'

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
  date: DateData
  periods: TimePeriod[]
}

type DateTimePeriodsMapper = (data: DateTimePeriods) => DateTimePeriods

const { PRODUCTION_CALENDAR_URL: productionCalendarUrl } = process.env

export const PRODUCTION_CALENDAR_URL = productionCalendarUrl!

export function makeProductionCalendarWithoutSaturdayWeekend(
  data: ProductionCalendarData
): ProductionCalendar {
  const entries = Object.entries(data) as Array<[JSONDate, DayType]>
  const entriesWithoutSaturdayWeekend = entries.filter(
    ([d, t]) => t !== DayType.Weekend || new Date(d).getDay() !== 6
  )
  return new Map(entriesWithoutSaturdayWeekend)
}

const DEFAULT_DATE_FORMAT = "i yyyy-MM-dd'T'HH:mm:ss"

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

export interface FreePeriodsCalculatorConfig {
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  currentDateTime: DateTimeData
}

export function makeFreeTimePeriodsCalculatorForDate({
  openingHours,
  productionCalendar,
  currentDateTime,
}: FreePeriodsCalculatorConfig): (date: Date) => TimePeriod[] {
  const { subtractPeriods, sortAndUnitePeriods } = timePeriodsAPI
  const getOpeningHours = (date: Date): DateTimePeriods => {
    const period = openingHours[date.getDay() as WeekDay]
    return {
      date: dateToDateData(date),
      periods: period ? [period] : [],
    }
  }
  const applyCurrentDateTime: DateTimePeriodsMapper = (data) => {
    const { date, periods } = data
    const compareResult = compareDate(date, currentDateTime)
    if (compareResult < 0) {
      return {
        date,
        periods: [],
      }
    }
    if (compareResult > 0) {
      return data
    }
    const period: TimePeriod = {
      start: {
        hours: 0,
        minutes: 0,
      },
      end: currentDateTime,
    }
    return {
      date,
      periods: sortAndUnitePeriods(
        periods.flatMap((p) => subtractPeriods(p, period))
      ),
    }
  }
  const applyProductionCalendar: DateTimePeriodsMapper = (data) => {
    const { date, periods } = data
    const dayType = productionCalendar.get(dateDataToJSON(date))
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
        let minutesToReduce = -60
        let i = simplifiedPeriods.length
        let reducedLastPeriod: TimePeriod
        do {
          const lastPeriod = simplifiedPeriods[--i]
          const shift = makeTimeShifter({ minutes: minutesToReduce })
          reducedLastPeriod = {
            start: lastPeriod.start,
            end: shift(lastPeriod.end),
          }
          minutesToReduce = getTimePeriodDurationInMinutes(reducedLastPeriod)
        } while (minutesToReduce < 0 && i > 0)
        return {
          date,
          periods:
            minutesToReduce < 0
              ? []
              : simplifiedPeriods.slice(0, i).concat(reducedLastPeriod),
        }
      }
      default: {
        const neverType: never = dayType
        throw new TypeError(`Unknown day type: "${String(neverType)}"`)
      }
    }
  }
  return (date: Date) =>
    applyProductionCalendar(applyCurrentDateTime(getOpeningHours(date))).periods
}

export function makeFreeTimePeriodsWithDurationCalculator(
  duration: number,
  sampleRate: number
): (period: TimePeriod) => TimePeriod[] {
  const durationShift = makeTimeShifter({ minutes: duration })
  const sampleRateShift = makeTimeShifter({ minutes: sampleRate })
  function getFreeTimePeriods(period: TimePeriod): TimePeriod[] {
    const { start, end } = period
    const rest = start.minutes % sampleRate
    if (rest !== 0) {
      return getFreeTimePeriods({
        start: makeTimeShifter({ minutes: sampleRate - rest })(start),
        end,
      })
    }
    const periodDuration = getTimePeriodDurationInMinutes(period)
    if (periodDuration < duration) {
      return []
    }
    return [{ start, end: durationShift(start) }].concat(
      timePeriodsAPI
        .subtractPeriods(period, { start, end: sampleRateShift(start) })
        .flatMap(getFreeTimePeriods)
    )
  }
  return getFreeTimePeriods
}

export function makeNextAvailableDayCalculator(
  productionCalendar: ProductionCalendar
): (today: Date | JSONDate) => JSONDate {
  return (today) => {
    const date = new Date(today)
    let nextAvailableDay: JSONDate
    let dayType: DayType | undefined
    do {
      date.setDate(date.getDate() + 1)
      nextAvailableDay = dateDataToJSON(dateToDateData(date))
      dayType = productionCalendar.get(nextAvailableDay)
    } while (dayType === DayType.Holiday || dayType === DayType.Weekend)
    return nextAvailableDay
  }
}

export function makeWorkBreaksCalculator(
  workBreaks: WorkBreaks
): (date: Date) => WorkBreak[] {
  return (date) => {
    const defaultDate = format(date, DEFAULT_DATE_FORMAT)
    return workBreaks.filter(({ matchExpression, dateFormat }) =>
      new RegExp(matchExpression).test(
        dateFormat ? format(date, dateFormat) : defaultDate
      )
    )
  }
}

export function makeBusyPeriodsCalculator(
  busyPeriods: BusyPeriods
): (date: Date) => BusyPeriods {
  return (date) => {
    const dayPeriod = dateToDayDateTimePeriod(date)
    return busyPeriods
      .map((p) => dateTimePeriodsAPI.intersectPeriods(p, dayPeriod))
      .filter(dateTimePeriodsAPI.isValidPeriod)
  }
}
