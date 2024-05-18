import { useEffect } from 'react'

import {
  type FormattedDate,
  durationInMinutes,
  formatDate,
  formatTime,
  formattedToDate,
} from '@/shared/date'
import { BigLoader } from '@/components/big-loader'
import { ErrorText } from '@/components/error-text'
import { ScheduleEntryType, isErr } from '@/adapters/domain'

import { trpc } from '@/client-init'

const TIME_PERIOD_BG_COLORS: Record<ScheduleEntryType, string> = {
  [ScheduleEntryType.Busy]: 'bg-error',
  [ScheduleEntryType.Free]: 'bg-primary',
}

const scale = 0.1

export interface ScheduleProps {
  selectedDate: FormattedDate
  setDate: (date: FormattedDate) => void
}

export function Schedule({
  selectedDate,
  setDate,
}: ScheduleProps): JSX.Element {
  const {
    isPending,
    isError,
    data: schedule,
    error,
  } = trpc.schedule.useQuery(formattedToDate(selectedDate).toISOString())
  useEffect(() => {
    if (!schedule || isErr(schedule)) {
      return
    }
    setDate(formatDate(new Date(schedule.value.date)))
  }, [schedule, setDate])
  if (isPending) {
    return <BigLoader />
  }
  if (isError) {
    return <ErrorText text={error.message} />
  }
  if (isErr(schedule)) {
    return <ErrorText text={schedule.error} />
  }
  const { entries } = schedule.value
  return (
    <>
      {entries.map((entry, i) => {
        const duration = durationInMinutes(
          entry.dateTimePeriod.start.time,
          entry.dateTimePeriod.end.time
        )
        return (
          <div
            key={i}
            className={`relative rounded-md flex justify-center items-center mx-12 ${
              TIME_PERIOD_BG_COLORS[entry.type]
            }`}
            style={{
              height: `${duration * scale}rem`,
            }}
          >
            <span className="absolute top-0 -left-12">
              {formatTime(entry.dateTimePeriod.start.time)}
            </span>
            <span className="absolute bottom-0 -right-12">
              {formatTime(entry.dateTimePeriod.end.time)}
            </span>
            <span className="text-2xl text-black">{entry.title}</span>
          </div>
        )
      })}
    </>
  )
}
