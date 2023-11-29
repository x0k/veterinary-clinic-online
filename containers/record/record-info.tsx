import { Button, Center, Heading, Text } from '@chakra-ui/react'

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
