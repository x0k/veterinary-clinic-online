import {
  Button,
  Center,
  Heading,
  Text,
} from '@chakra-ui/react'

import {
  ClinicRecord,
  ClinicRecordID,
  ClinicRecordStatus,
} from '@/models/clinic'
import {
  compareDate,
  dateTimeDataToDate,
  DateTimePeriod,
  dateTimePeriodsAPI,
  dateToDateTimeData,
  formatDate,
  timeDataToJSON,
} from '@/models/date'

export interface RecordInfoProps {
  isRecordsFetching: boolean
  record: ClinicRecord
  hasRecordsBefore: boolean
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
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
  isRecordsFetching,
  dismissRecord,
}: RecordInfoProps): JSX.Element {
  const inWork = status === ClinicRecordStatus.InWork
  const shouldBeInWork = dateTimePeriodsAPI.makePeriodContainsCheck(
    dateTimePeriod
  )(dateToDateTimeData(new Date()))
  const handleCancel = (): void => {
    void dismissRecord(id)
  }
  return (
    <Center minHeight="inherit" flexDirection="column" gap="2">
      {inWork ? (
        <Heading>Вы в процессе получения услуги!</Heading>
      ) : (
        <>
          <Heading size="xl">Вы записаны</Heading>
          {!shouldBeInWork ? (
            <>
              <Text>{makeWaitedStateText(dateTimePeriod)}</Text>
              <Button
                isLoading={isRecordsFetching}
                onClick={handleCancel}
                colorScheme="red"
              >
                Отменить запись
              </Button>
            </>
          ) : hasRecordsBefore ? (
            <>
              <Text>Ваша очередь задерживается</Text>
              <Button
                isLoading={isRecordsFetching}
                onClick={handleCancel}
                colorScheme="red"
              >
                Отменить запись
              </Button>
            </>
          ) : (
            <Text>Настала ваша очередь!</Text>
          )}
        </>
      )}
    </Center>
  )
}
