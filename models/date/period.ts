import { makePeriodsAPI, type Period } from '@/lib/period'

import { compareDateTime, compareTime, type DateTimeData, type TimeData } from './common'

export type TimePeriod = Period<TimeData>

export type DateTimePeriod = Period<DateTimeData>

export const timePeriodsAPI = makePeriodsAPI({ compare: compareTime })

export const dateTimePeriodsAPI = makePeriodsAPI({ compare: compareDateTime })

export function getTimePeriodDurationInMinutes({
  start,
  end,
}: TimePeriod): number {
  return (end.hours - start.hours) * 60 + (end.minutes - start.minutes)
}
