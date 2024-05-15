import { useEffect, useMemo, useState } from 'react'
import { type CreateTRPCReact } from '@trpc/react-query'
import { signIn } from 'next-auth/react'

import { BigLoader } from '@/components/big-loader'
import { ScheduleEntryType, isErr } from '@/adapters/domain'
import {
  durationInMinutes,
  formatDate,
  formatTime,
  toIsoDate,
} from '@/domains/date'
import { type AppRouter } from '@/trpc/model'

const TIME_PERIOD_BG_COLORS: Record<ScheduleEntryType, string> = {
  [ScheduleEntryType.Busy]: 'bg-error',
  [ScheduleEntryType.Free]: 'bg-primary',
}

const scale = 0.1

interface ErrorTextProps {
  errorMessage: string
}

function ErrorText({ errorMessage }: ErrorTextProps): JSX.Element {
  return <p className="text-center text-error">{errorMessage}</p>
}

interface ScheduleProps {
  trpc: CreateTRPCReact<AppRouter, unknown>
  selectedDate: string
  setDate: (date: string) => void
}

function Schedule({ trpc, selectedDate, setDate }: ScheduleProps): JSX.Element {
  const {
    isPending,
    isError,
    data: schedule,
    error,
  } = trpc.schedule.useQuery(toIsoDate(selectedDate))
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
    return <ErrorText errorMessage={error.message} />
  }
  if (isErr(schedule)) {
    return <ErrorText errorMessage={schedule.error} />
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

export interface OpeningHoursContainerProps {
  trpc: CreateTRPCReact<AppRouter, unknown>
}

export function OpeningHoursContainer({
  trpc,
}: OpeningHoursContainerProps): JSX.Element {
  const today = useMemo(() => formatDate(new Date()), [])
  const [selectedDate, setDate] = useState(today)
  return (
    <div className="flex flex-col gap-4 grow py-4 w-full max-w-sm shrink-0">
      <div className="flex items-baseline gap-2">
        <span className="grow">График работы на </span>
        <input
          type="date"
          className="max-w-max input input-bordered input-sm"
          value={selectedDate}
          onChange={(e) => {
            setDate(e.target.value)
          }}
          min={today}
        />
      </div>
      <p className="text-center">
        Чтобы записаться необходимо{' '}
        <button
          className="btn btn-link btn-sm"
          onClick={() => {
            void signIn()
          }}
        >
          войти
        </button>
      </p>
      <Schedule trpc={trpc} selectedDate={selectedDate} setDate={setDate} />
    </div>
  )
}
