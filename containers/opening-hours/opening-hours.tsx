import { useMemo, useState } from 'react'
import { BackgroundProps, Box, Input, Text, Link } from '@chakra-ui/react'
import isValid from 'date-fns/isValid'
import NextLink from 'next/link'

import {
  makeBusyPeriodsCalculator,
  makeFreeTimePeriodsCalculatorForDate,
  makeNextAvailableDayCalculator,
  makeWorkBreaksCalculator,
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

type TimePeriodWithType = TimePeriod & {
  type: TimePeriodType
  title: string
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
          marginX="3rem"
        >
          <Text position="absolute" top="0" left="-3rem">
            {timeDataToJSON(period.start)}
          </Text>
          <Text position="absolute" bottom="0" right="-3rem">
            {timeDataToJSON(period.end)}
          </Text>
          <Text fontSize="2xl" color="white">
            {period.title}
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
  const getBusyPeriods = useMemo(
    () => makeBusyPeriodsCalculator(clinicRecords.map((r) => r.dateTimePeriod)),
    [clinicRecords]
  )
  const getWorkBreaks = useMemo(
    () => makeWorkBreaksCalculator(workBreaks),
    [workBreaks]
  )
  const getFreeTimePeriodsForDate = useMemo(
    () =>
      makeFreeTimePeriodsCalculatorForDate({
        openingHours,
        productionCalendar,
        currentDateTime: dateToDateTimeData(new Date()),
      }),
    [openingHours, productionCalendar]
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
    const workBreaks: TimePeriodWithType[] = getWorkBreaks(date).map((workBreak) => ({
      ...workBreak.period,
      type: TimePeriodType.Busy,
      title: workBreak.title,
    }))
    const busyPeriods: TimePeriodWithType[] = timePeriodsAPI
      .sortAndUnitePeriods(getBusyPeriods(date))
      .map((period) => ({
        ...period,
        type: TimePeriodType.Busy,
        title: 'Занято',
      }))
    const freePeriods = timePeriodsAPI.sortAndUnitePeriods(
      timePeriodsAPI.subtractPeriodsFromPeriods(
        getFreeTimePeriodsForDate(date),
        workBreaks.concat(busyPeriods)
      )
    )

    const periods: TimePeriodWithType[] = freePeriods
      .map((p) => ({ ...p, type: TimePeriodType.Free, title: 'Свободно' }))
      .concat(workBreaks, busyPeriods)
      .sort(timePeriodsAPI.comparePeriods)
    return periods
  }, [getBusyPeriods, getWorkBreaks, getFreeTimePeriodsForDate, selectedDate])
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
          Введите правильную дату
        </Text>
      )}
    </Box>
  )
}
