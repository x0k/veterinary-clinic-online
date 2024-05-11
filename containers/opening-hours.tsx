import { useEffect, useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

import { BigLoader } from '@/components/big-loader'
import { type RootDomain, ScheduleEntryType, isErr } from '@/adapters/domain'
import { formatDate, formatTime, toIsoDate } from '@/domains/date'
import { useDomain } from '@/domains/domain'

export interface OpeningHoursContainerProps {
  domain: RootDomain
}

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
  domain: RootDomain
  selectedDate: string
  setDate: (date: string) => void
}

function Schedule({
  domain,
  selectedDate,
  setDate,
}: ScheduleProps): JSX.Element {
  const {
    isPending,
    isError,
    data: schedule,
    error,
  } = useQuery({
    queryKey: ['schedule', selectedDate],
    queryFn: () => domain.appointment.schedule(toIsoDate(selectedDate)),
  })
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
    return <ErrorText errorMessage={schedule.error.message} />
  }
  const { entries } = schedule.value
  return (
    <>
      {entries.map((entry, i) => {
        const duration = domain.shared.timePeriodDurationInMinutes({
          start: entry.dateTimePeriod.start.time,
          end: entry.dateTimePeriod.end.time,
        })
        if (isErr(duration)) {
          return null
        }
        return (
          <div
            key={i}
            className={`relative rounded-md flex justify-center items-center mx-12 ${
              TIME_PERIOD_BG_COLORS[entry.type]
            }`}
            style={{
              height: `${duration.value * scale}rem`,
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

export function OpeningHoursContainer(): JSX.Element {
  const domain = useDomain()
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
      <Schedule domain={domain} selectedDate={selectedDate} setDate={setDate} />
    </div>
  )
}
