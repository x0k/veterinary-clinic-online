import { type ClinicRecord, ClinicRecordStatus } from '@/models/clinic'
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
  const inWork = status === ClinicRecordStatus.InWork
  const shouldBeInWork = dateTimePeriodsAPI.makePeriodContainsCheck(
    dateTimePeriod
  )(dateToDateTimeData(new Date()))
  const handleCancel = (): void => {
    void dismissRecord(id)
  }
  return (
    <div className="grow flex flex-col justify-center items-center gap-2">
      {inWork ? (
        <p className="text-3xl font-bold">Вы в процессе получения услуги!</p>
      ) : (
        <>
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
          ) : (
            <p>Настала ваша очередь!</p>
          )}
        </>
      )}
    </div>
  )
}
