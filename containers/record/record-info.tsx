import { Button, Center, Heading, Text } from '@chakra-ui/react'

import { ClinicRecord } from '@/models/clinic'
import {
  dateTimeDataToDate,
  dateToTimeData,
  formatDate,
  timePeriodsAPI,
} from '@/models/date'

export interface RecordInfoProps {
  record: ClinicRecord
  hasRecordsBefore: boolean
  dismissRecord: () => void
}

export function RecordInfo({
  record,
  hasRecordsBefore,
  dismissRecord,
}: RecordInfoProps): JSX.Element {
  const shouldBeInWork = timePeriodsAPI.makePeriodContainsCheck(
    record.dateTimePeriod
  )(dateToTimeData(new Date()))
  return (
    <Center height="full" flexDirection="column" gap="2">
      <Heading size="xl">Вы записаны</Heading>
      {!shouldBeInWork ? (
        <>
          <Text>
            на {formatDate(dateTimeDataToDate(record.dateTimePeriod.start))}
          </Text>
          <Button onClick={dismissRecord}>Отменить запись</Button>
        </>
      ) : hasRecordsBefore ? (
        <>
          <Text>Ваша очередь задерживается</Text>
          <Button onClick={dismissRecord}>Отменить запись</Button>
        </>
      ) : (
        <Text>Настала ваша очередь!</Text>
      )}
    </Center>
  )
}
