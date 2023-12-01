import { useMemo, useState } from 'react'
import { Input, Text, Button } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import isValid from 'date-fns/isValid'

import {
  makeBusyPeriodsCalculator,
  makeFreeTimePeriodsCalculatorForDate,
  makeNextAvailableDayCalculator,
  makeWorkBreaksCalculator,
  type OpeningHours,
  type ProductionCalendar,
  type WorkBreaks,
} from '@/models/schedule'
import {
  dateDataToJSON,
  dateToDateData,
  dateToDateTimeData,
  getTimePeriodDurationInMinutes,
  type JSONDate,
  timeDataToJSON,
  type TimePeriod,
  timePeriodsAPI,
} from '@/models/date'
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

const TIME_PERIOD_BG_COLORS: Record<TimePeriodType, string> = {
  [TimePeriodType.Busy]: 'bg-red-600',
  [TimePeriodType.Free]: 'bg-teal-700',
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
        <div
          key={i}
          className={`relative rounded-md flex justify-center items-center mx-12 ${
            TIME_PERIOD_BG_COLORS[period.type]
          }`}
          style={{
            height: `${getTimePeriodDurationInMinutes(period) * scale}rem`,
          }}
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
        </div>
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
    const workBreaks: TimePeriodWithType[] = getWorkBreaks(date).map(
      (workBreak) => ({
        ...workBreak.period,
        type: TimePeriodType.Busy,
        title: workBreak.title,
      })
    )
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
    <div className="flex flex-col gap-4 grow py-4 w-full max-w-sm shrink-0">
      <div className="flex items-baseline gap-2">
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
      </div>
      <Text textAlign="center">
        Чтобы записаться необходимо{' '}
        <Button
          fontWeight="bold"
          variant="link"
          onClick={() => {
            void signIn()
          }}
        >
          войти
        </Button>
      </Text>
      {periods ? (
        <TimePeriodsComponent periods={periods} />
      ) : (
        <Text textAlign="center" textColor="red">
          Введите правильную дату
        </Text>
      )}
    </div>
  )
}
