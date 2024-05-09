import { useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'

import {
  makeNextAvailableDayCalculator,
  type OpeningHours,
  type ProductionCalendar,
  type WorkBreaks,
} from '@/models/schedule'
import { dateDataToJSON, dateToDateData, type JSONDate } from '@/models/date'
import { useClinic } from '@/domains/clinic'
import { BigLoader } from '@/components/big-loader'
import {
  type AppointmentScheduleDTO,
  type RootDomain,
  ScheduleEntryType,
  isError,
  type TimeDTO,
} from '@/adapters/domain'
import { useQuery } from '@tanstack/react-query'

export interface OpeningHoursContainerProps {
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
  domain: RootDomain
}

const TIME_PERIOD_BG_COLORS: Record<ScheduleEntryType, string> = {
  [ScheduleEntryType.Busy]: 'bg-error',
  [ScheduleEntryType.Free]: 'bg-primary',
}

const scale = 0.1

interface ScheduleProps {
  schedule: AppointmentScheduleDTO
  domain: RootDomain
}

function formatTime(time: TimeDTO): string {
  return `${time.hours}:${time.minutes.toString().padStart(2, '0')}`
}

function Schedule({
  schedule: { entries },
  domain,
}: ScheduleProps): JSX.Element {
  return (
    <>
      {entries.map((entry, i) => {
        const duration = domain.shared.timePeriodDurationInMinutes({
          start: entry.dateTimePeriod.start.time,
          end: entry.dateTimePeriod.end.time,
        })
        if (isError(duration)) {
          return null
        }
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

export function OpeningHoursContainer({
  productionCalendar,
  domain,
}: OpeningHoursContainerProps): JSX.Element {
  const { isRecordsLoading } = useClinic()
  const today = useMemo(() => dateDataToJSON(dateToDateData(new Date())), [])
  const [selectedDate, setDate] = useState(() =>
    makeNextAvailableDayCalculator(productionCalendar)(today)
  )
  const now = useMemo(() => new Date(), [])
  const schedule = useQuery({
    queryKey: ['schedule', now.toISOString()],
    queryFn: () => domain.appointment.schedule(now.toISOString()),
  })
  return isRecordsLoading ? (
    <BigLoader />
  ) : (
    <div className="flex flex-col gap-4 grow py-4 w-full max-w-sm shrink-0">
      <div className="flex items-baseline gap-2">
        <span className="grow">График работы на </span>
        <input
          type="date"
          className="max-w-max input input-bordered input-sm"
          value={selectedDate}
          onChange={(e) => {
            setDate(e.target.value as JSONDate)
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
      {schedule.data ? (
        <Schedule domain={domain} schedule={schedule.data} />
      ) : (
        <p className="text-center text-error">Введите правильную дату</p>
      )}
    </div>
  )
}
