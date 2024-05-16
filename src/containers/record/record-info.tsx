import { useMemo } from 'react'

import {
  type DateTimeDTO,
  type PeriodDTO,
  type AppointmentDTO,
  RecordStatusDTO,
} from '@/adapters/domain'
import {
  compareDomainDate,
  dateTimeToDate,
  formatDateWithLocal,
  formatTime,
} from '@/domains/date'

import { Subscription } from './subscription'
import { trpc } from '@/client-init'

export interface RecordInfoProps {
  appointment: AppointmentDTO
}

function makeWaitedStateText({ start, end }: PeriodDTO<DateTimeDTO>): string {
  return `на ${formatDateWithLocal(dateTimeToDate(start))} - ${
    compareDomainDate(start.date, end.date) === 0
      ? formatTime(end.time)
      : formatDateWithLocal(dateTimeToDate(end))
  }`
}

const RECORD_STATUS_TITLES: Record<RecordStatusDTO, string> = {
  [RecordStatusDTO.Awaits]: 'Ожидает',
  [RecordStatusDTO.Done]: 'Выполнено',
  [RecordStatusDTO.NotAppear]: 'Не пришел',
}

export function RecordInfo({
  appointment: {
    record: { dateTimePeriod, status, isArchived },
  },
}: RecordInfoProps): JSX.Element {
  const shouldBeInWork = useMemo(() => {
    const now = new Date()
    const start = dateTimeToDate(dateTimePeriod.start)
    return now >= start
  }, [dateTimePeriod])
  const { mutate, isPending } = trpc.cancelAppointment.useMutation()
  return (
    <div className="grow flex flex-col justify-center items-center gap-2">
      <p className="text-3xl font-bold">
        {isArchived ? 'Ваша запись закрыта' : 'Вы записаны'}
      </p>
      {!shouldBeInWork && !isArchived ? (
        <>
          <p>{makeWaitedStateText(dateTimePeriod)}</p>
          <button
            className="btn btn-error"
            disabled={isPending}
            onClick={() => {
              mutate()
            }}
          >
            Отменить запись
          </button>
        </>
      ) : status === RecordStatusDTO.Awaits ? (
        <p>Настала ваша очередь!</p>
      ) : (
        <p>Статус записи: {RECORD_STATUS_TITLES[status]}</p>
      )}
      <Subscription />
    </div>
  )
}
