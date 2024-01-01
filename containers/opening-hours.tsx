import { useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { isValid } from 'date-fns/isValid'

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
  [TimePeriodType.Busy]: 'bg-error',
  [TimePeriodType.Free]: 'bg-primary',
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
          <span className="absolute top-0 -left-12">
            {timeDataToJSON(period.start)}
          </span>
          <span className="absolute bottom-0 -right-12">
            {timeDataToJSON(period.end)}
          </span>
          <span className="text-2xl text-black">{period.title}</span>
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
        title: 'Запись',
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
        <span className="grow">График работы на </span>
        <input
          type="date"
          className="max-w-max input input-bordered input-sm"
          value={selectedDate}
          onChange={(e) => {
            setDate(e.target.value as JSONDate)
          }}
          min={today}
        />
      </div>
      <p className="text-center">
        Чтобы записаться необходимо{' '}
        <button
          className='btn btn-link btn-sm'
          onClick={() => {
            void signIn()
          }}
        >
          войти
        </button>
      </p>
      {periods ? (
        <TimePeriodsComponent periods={periods} />
      ) : (
        <p className="text-center text-error">Введите правильную дату</p>
      )}
    </div>
  )
}
