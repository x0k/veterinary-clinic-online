import {
  Button,
  Center,
  CircularProgress,
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
import { useMutation } from 'react-query'

export interface RecordInfoProps {
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
  dismissRecord,
}: RecordInfoProps): JSX.Element {
  const inWork = status === ClinicRecordStatus.InWork
  const shouldBeInWork = dateTimePeriodsAPI.makePeriodContainsCheck(
    dateTimePeriod
  )(dateToDateTimeData(new Date()))
  const { mutate, isLoading } = useMutation(dismissRecord)
  const handleCancel = (): void => {
    mutate(id)
  }
  return (
    <Center height="full" flexDirection="column" gap="2">
      {isLoading ? (
        <CircularProgress isIndeterminate size="8rem" color="teal.500" />
      ) : inWork ? (
        <Heading>Вы в процессе получения услуги!</Heading>
      ) : (
        <>
          <Heading size="xl">Вы записаны</Heading>
          {!shouldBeInWork ? (
            <>
              <Text>{makeWaitedStateText(dateTimePeriod)}</Text>
              <Button onClick={handleCancel} colorScheme="red">
                Отменить запись
              </Button>
            </>
          ) : hasRecordsBefore ? (
            <>
              <Text>Ваша очередь задерживается</Text>
              <Button onClick={handleCancel} colorScheme="red">
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
