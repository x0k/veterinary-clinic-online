import { useMemo, useState } from 'react'
import { BackgroundProps, Box, Input, Text, Link } from '@chakra-ui/react'
import isValid from 'date-fns/isValid'
import NextLink from 'next/link'

import {
  getMissingTimePeriods,
  makeFreeTimePeriodsCalculatorForDate,
  makeNextAvailableDayCalculator,
  OpeningHours,
  ProductionCalendar,
  WorkBreaks,
} from '@/models/schedule'
import {
  dateDataToJSON,
  dateToDateData,
  dateToDateTimeData,
  getTimePeriodDurationInMinutes,
  JSONDate,
  timeDataToJSON,
  TimePeriod,
  timePeriodsAPI,
} from '@/models/date'
import { AuthenticationType, makeAuthenticationLink } from '@/models/auth'
import { useClinic } from '@/domains/clinic'
import { BigLoader } from '@/components/big-loader'

export interface OpeningHoursContainerProps {
  sampleRate: number
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
}

enum TimePeriodType {
  Free = 'free',
  Busy = 'busy',
}

const TIME_PERIOD_BG_COLORS: Record<
  TimePeriodType,
  BackgroundProps['bgColor']
> = {
  [TimePeriodType.Busy]: 'red',
  [TimePeriodType.Free]: 'teal',
}

const TIME_PERIOD_TITLES: Record<TimePeriodType, string> = {
  [TimePeriodType.Free]: 'Свободно',
  [TimePeriodType.Busy]: 'Занято',
}

type TimePeriodWithType = TimePeriod & {
  type: TimePeriodType
}

interface TimePeriodsProps {
  periods: TimePeriodWithType[]
}

const scale = 0.1

function TimePeriodsComponent({ periods }: TimePeriodsProps): JSX.Element {
  return (
    <>
      {periods.map((period, i) => (
        <Box
          key={i}
          bgColor={TIME_PERIOD_BG_COLORS[period.type]}
          height={`${getTimePeriodDurationInMinutes(period) * scale}rem`}
          position="relative"
          borderRadius="md"
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginLeft="3rem"
        >
          <Text position="absolute" top="0" left="-3rem">
            {timeDataToJSON(period.start)}
          </Text>
          {i === periods.length - 1 && (
            <Text position="absolute" bottom="0" left="-3rem">
              {timeDataToJSON(period.end)}
            </Text>
          )}
          <Text fontSize="3xl" color="white">
            {TIME_PERIOD_TITLES[period.type]}
          </Text>
        </Box>
      ))}
    </>
  )
}

export function OpeningHoursContainer({
  openingHours,
  productionCalendar,
  sampleRate,
  workBreaks,
}: OpeningHoursContainerProps): JSX.Element {
  const { isRecordsLoading, clinicRecords } = useClinic()
  const busyPeriods = useMemo(
    () => clinicRecords.map((r) => r.dateTimePeriod),
    [clinicRecords]
  )
  const getFreeTimePeriodsForDate = useMemo(
    () =>
      makeFreeTimePeriodsCalculatorForDate({
        openingHours,
        busyPeriods,
        productionCalendar,
        workBreaks,
        currentDateTime: dateToDateTimeData(new Date()),
      }),
    [openingHours, busyPeriods, productionCalendar, workBreaks]
  )
  const today = useMemo(() => dateDataToJSON(dateToDateData(new Date())), [])
  const [selectedDate, setDate] = useState(() =>
    makeNextAvailableDayCalculator(productionCalendar)(today)
  )
  const periods = useMemo(() => {
    const date = new Date(selectedDate)
    if (!isValid(date)) {
      return null
    }
    const freePeriods = getFreeTimePeriodsForDate(date)
    const missingPeriods = getMissingTimePeriods(freePeriods)
    const periods: TimePeriodWithType[] = freePeriods
      .map((p) => ({ ...p, type: TimePeriodType.Free }))
      .concat(missingPeriods.map((p) => ({ ...p, type: TimePeriodType.Busy })))
      .sort(timePeriodsAPI.comparePeriods)
    return periods
  }, [getFreeTimePeriodsForDate, selectedDate])
  return isRecordsLoading ? (
    <BigLoader />
  ) : (
    <Box
      display="flex"
      flexDirection="column"
      gap="4"
      minHeight="inherit"
      maxWidth="sm"
      marginX="auto"
      py="4"
    >
      <Box display="flex" alignItems="baseline" gap="2">
        <Text flexGrow="1">График работы на </Text>
        <Input
          type="date"
          maxWidth="max-content"
          value={selectedDate}
          onChange={(e) => {
            setDate(e.target.value as JSONDate)
          }}
          min={today}
        />
      </Box>
      <Text textAlign="center">
        Чтобы записаться необходимо{' '}
        <Link
          fontWeight="bold"
          href={makeAuthenticationLink(AuthenticationType.VK)}
          as={NextLink}
        >
          войти
        </Link>
      </Text>
      {periods ? (
        <TimePeriodsComponent periods={periods} />
      ) : (
        <Text textAlign="center" textColor="red">
          Укажите валидную дату
        </Text>
      )}
    </Box>
  )
}
