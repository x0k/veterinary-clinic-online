import { useCallback, useMemo } from 'react'
import NextLink from 'next/link'
import { Box, Button, Link } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'

import { type ClinicServiceEntity } from '@/models/clinic'
import { type UserData } from '@/models/user'
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
  type TimePeriod,
  dateDataToJSON,
  dateToDateData,
  dateToDateTimeData,
  makeDateTimeShifter,
  timePeriodsAPI,
} from '@/models/date'
import { AppRoute } from '@/models/app'
import { useClinic } from '@/domains/clinic'

import { type FormFields } from './model'
import { SimpleFormFields } from './simple-form-fields'
import { TimePeriodSelect } from './time-period-select'

export interface CreateRecordProps {
  sampleRate: number
  userData: UserData
  clinicServices: ClinicServiceEntity[]
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
}

export function CreateRecord({
  clinicServices,
  openingHours,
  productionCalendar,
  userData,
  workBreaks,
  sampleRate,
}: CreateRecordProps): JSX.Element {
  const { createRecord, clinicRecords, isRecordsFetching } = useClinic()
  const [today, nextAvailableDay] = useMemo(() => {
    const date = new Date()
    const today = dateDataToJSON(dateToDateData(date))
    const nextAvailableDay =
      makeNextAvailableDayCalculator(productionCalendar)(date)
    return [today, nextAvailableDay]
  }, [])
  const busyPeriods = useMemo(
    () => clinicRecords.map((r) => r.dateTimePeriod),
    [clinicRecords]
  )
  const getFreeTimePeriodsForDate = useMemo(() => {
    const getFreeTimePeriods = makeFreeTimePeriodsCalculatorForDate({
      openingHours,
      productionCalendar,
      currentDateTime: dateToDateTimeData(new Date()),
    })
    const getBusyPeriods = makeBusyPeriodsCalculator(busyPeriods)
    const getWorkBreaks = makeWorkBreaksCalculator(workBreaks)
    return (date: Date) =>
      timePeriodsAPI.sortAndUnitePeriods(
        timePeriodsAPI.subtractPeriodsFromPeriods(
          getFreeTimePeriods(date),
          getWorkBreaks(date)
            .map((wb) => wb.period)
            .concat(getBusyPeriods(date))
        )
      )
  }, [openingHours, busyPeriods, productionCalendar, workBreaks])
  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      service: clinicServices[0].id,
      recordDate: nextAvailableDay,
      userName: userData.name,
      userPhone: userData.phone,
    },
    mode: 'onChange',
  })
  const handleCreate = useCallback(
    ({ recordDate, service, recordTime, userName, userPhone }: FormFields) => {
      const timePeriod = JSON.parse(recordTime) as TimePeriod
      const date = new Date(recordDate)
      const shift = makeDateTimeShifter({ minutes: date.getTimezoneOffset() })
      const dateData = dateToDateData(date)
      return createRecord({
        identity: userData.id,
        service,
        userName,
        userEmail: userData.email ?? '',
        userPhone,
        utcDateTimePeriod: {
          start: shift({ ...dateData, ...timePeriod.start }),
          end: shift({ ...dateData, ...timePeriod.end }),
        },
      })
    },
    [createRecord, userData]
  )
  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(handleCreate)}
      style={{ width: '100%', minHeight: 'inherit' }}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="4"
        maxW="sm"
        marginX="auto"
        minHeight="inherit"
        py="4"
      >
        <SimpleFormFields
          today={today}
          clinicServices={clinicServices}
          errors={errors}
          register={register}
        />
        <TimePeriodSelect
          sampleRate={sampleRate}
          clinicServices={clinicServices}
          control={control}
          getFreeTimePeriodsForDate={getFreeTimePeriodsForDate}
          setValue={setValue}
        />
        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isSubmitting || isRecordsFetching}
        >
          Записаться
        </Button>
        <Link
          as={NextLink}
          href={AppRoute.Privacy}
          textAlign="center"
          target="_blank"
        >
          Политика конфиденциальности
        </Link>
      </Box>
    </form>
  )
}
