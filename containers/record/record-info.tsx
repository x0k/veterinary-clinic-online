import { ClinicRecordStatus, type ClinicRecord, CLINIC_RECORD_STATUS_TITLES } from '@/models/clinic'
import {
  compareDate,
  dateTimeDataToDate,
  type DateTimePeriod,
  dateTimePeriodsAPI,
  dateToDateTimeData,
  formatDate,
  timeDataToJSON,
} from '@/models/date'
import { useClinic } from '@/domains/clinic'

import { Subscription } from './subscription'

export interface RecordInfoProps {
  record: ClinicRecord
  hasRecordsBefore: boolean
}

function makeWaitedStateText({ start, end }: DateTimePeriod): string {
  return `на ${formatDate(dateTimeDataToDate(start))} - ${
    compareDate(start, end) === 0
      ? timeDataToJSON(end)
      : formatDate(dateTimeDataToDate(end))
  }`
}

export function RecordInfo({
  record: { id, dateTimePeriod, status },
  hasRecordsBefore,
}: RecordInfoProps): JSX.Element {
  const { isRecordsFetching, dismissRecord } = useClinic()
  const shouldBeInWork = dateTimePeriodsAPI.makePeriodContainsCheck(
    dateTimePeriod
  )(dateToDateTimeData(new Date()))
  const handleCancel = (): void => {
    void dismissRecord(id)
  }
  return (
    <div className="grow flex flex-col justify-center items-center gap-2">
      <p className="text-3xl font-bold">Вы записаны</p>
      {!shouldBeInWork ? (
        <>
          <p>{makeWaitedStateText(dateTimePeriod)}</p>
          <button
            className="btn btn-error"
            disabled={isRecordsFetching}
            onClick={handleCancel}
          >
            Отменить запись
          </button>
        </>
      ) : hasRecordsBefore ? (
        <>
          <p>Ваша очередь задерживается</p>
          <button
            className="btn btn-error"
            disabled={isRecordsFetching}
            onClick={handleCancel}
          >
            Отменить запись
          </button>
        </>
      ) : status === ClinicRecordStatus.Awaits ? (
        <p>Настала ваша очередь!</p>
      ) : (
        <p>Статус записи: {CLINIC_RECORD_STATUS_TITLES[status]}</p>
      )}
      <Subscription />
    </div>
  )
}
