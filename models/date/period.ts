import { z } from 'zod'

import { makePeriodsAPI, type Period } from '@/lib/period'

import {
  compareDateTime,
  compareTime,
  timeDataSchema,
  type DateTimeData,
  type TimeData,
  DateTimeDataSchema,
} from './common'

export const timePeriodSchema = z.object({
  start: timeDataSchema,
  end: timeDataSchema,
})

export type TimePeriod = Period<TimeData>

export const dateTimePeriodSchema = z.object({
  start: DateTimeDataSchema,
  end: DateTimeDataSchema,
})

export type DateTimePeriod = Period<DateTimeData>

export const timePeriodsAPI = makePeriodsAPI({ compare: compareTime })

export const dateTimePeriodsAPI = makePeriodsAPI({ compare: compareDateTime })

export function getTimePeriodDurationInMinutes({
  start,
  end,
}: TimePeriod): number {
  return (end.hours - start.hours) * 60 + (end.minutes - start.minutes)
}
