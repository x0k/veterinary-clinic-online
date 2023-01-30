import { useCallback, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
} from '@chakra-ui/react'
import {
  Control,
  Controller,
  useForm,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form'
import isValid from 'date-fns/isValid'

import {
  ClinicRecord,
  ClinicRecordCreate,
  ClinicServiceEntity,
  ClinicServiceEntityID,
} from '@/models/clinic'
import { UserData } from '@/models/user'
import {
  makeFreeTimePeriodsCalculatorForDate,
  makeFreeTimePeriodsWithDurationCalculator,
  OpeningHours,
  ProductionCalendar,
  WorkBreaks,
} from '@/models/schedule'
import {
  JSONDate,
  TimePeriod,
  timeDataToJSON,
  dateDataToJSON,
  dateToDateData,
  dateToDateTimeData,
  makeDateTimeShifter,
} from '@/models/date'

export interface CreateRecordProps {
  userData: UserData
  clinicServices: ClinicServiceEntity[]
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
  clinicRecords: ClinicRecord[]
  createRecord: (data: ClinicRecordCreate) => Promise<void>
}

interface FormFields {
  service: ClinicServiceEntityID
  recordDate: JSONDate
  userName: string
  userPhone: string
  recordTime: string
}

const REQUIRED_FIELD_ERROR_MESSAGE = 'Это поле обязательно для заполнения'

interface TimePeriodSelectProps {
  control: Control<FormFields, any>
  clinicServices: ClinicServiceEntity[]
  getFreeTimePeriodsForDate: (date: Date) => TimePeriod[]
  setValue: UseFormSetValue<FormFields>
}

function TimePeriodSelect({
  setValue,
  control,
  clinicServices,
  getFreeTimePeriodsForDate,
}: TimePeriodSelectProps): JSX.Element {
  const [selectedServiceId, selectedDate] = useWatch({
    name: ['service', 'recordDate'],
    control,
  })
  const freeTimePeriods = useMemo(() => {
    const date = new Date(selectedDate)
    return isValid(date) ? getFreeTimePeriodsForDate(date) : null
  }, [getFreeTimePeriodsForDate, selectedDate])
  const getTimePeriodsForService = useMemo(() => {
    const service =
      selectedServiceId &&
      clinicServices.find((s) => s.id === selectedServiceId)
    return service
      ? makeFreeTimePeriodsWithDurationCalculator(service.durationInMinutes)
      : null
  }, [selectedServiceId, clinicServices])
  const periods = useMemo(
    () =>
      getTimePeriodsForService && freeTimePeriods
        ? freeTimePeriods.flatMap(getTimePeriodsForService)
        : [],
    [getTimePeriodsForService, freeTimePeriods]
  )
  const periodValues = useMemo(
    () => periods.map((period) => JSON.stringify(period)),
    [periods]
  )
  useEffect(() => {
    setValue('recordTime', '')
  }, [periods, setValue])
  return (
    <Controller
      control={control}
      name="recordTime"
      rules={{ required: REQUIRED_FIELD_ERROR_MESSAGE }}
      render={({ field, fieldState: { invalid, error } }) => (
        <FormControl isInvalid={invalid}>
          <FormLabel htmlFor="recordTime">Время</FormLabel>
          <RadioGroup id="recordTime" {...field}>
            <Box display="flex" flexDirection="column" gap="4">
              {periods.map((p, i) => (
                <Radio key={periodValues[i]} value={periodValues[i]}>
                  {timeDataToJSON(p.start)} - {timeDataToJSON(p.end)}
                </Radio>
              ))}
            </Box>
          </RadioGroup>
          <FormErrorMessage>{error?.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  )
}

export function CreateRecord({
  clinicRecords,
  clinicServices,
  openingHours,
  productionCalendar,
  userData,
  workBreaks,
  createRecord,
}: CreateRecordProps): JSX.Element {
  const [today, nextAvailableDay] = useMemo(() => {
    const date = new Date()
    const today = dateDataToJSON(dateToDateData(date))
    let nextAvailableDay: JSONDate
    do {
      date.setDate(date.getDate() + 1)
      nextAvailableDay = dateDataToJSON(dateToDateData(date))
    } while (productionCalendar.has(nextAvailableDay))
    return [today, nextAvailableDay]
  }, [])
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
      style={{ width: '100%', height: '100%' }}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="4"
        maxW="sm"
        marginX="auto"
        height="full"
      >
        <FormControl isInvalid={Boolean(errors.userName)}>
          <FormLabel htmlFor="userName">Имя</FormLabel>
          <Input
            id="userName"
            {...register('userName', {
              required: REQUIRED_FIELD_ERROR_MESSAGE,
            })}
          />
          <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.userPhone)}>
          <FormLabel htmlFor="userPhone">Телефон</FormLabel>
          <Input
            id="userPhone"
            type="tel"
            {...register('userPhone', {
              required: REQUIRED_FIELD_ERROR_MESSAGE,
            })}
          />
          <FormErrorMessage>{errors.userPhone?.message}</FormErrorMessage>
        </FormControl>
        <Box display={{ sm: 'flex' }} gap="4">
          <FormControl isInvalid={Boolean(errors.service)} flexGrow="1">
            <FormLabel htmlFor="service">Услуга</FormLabel>
            <Select
              id="service"
              {...register('service', {
                required: REQUIRED_FIELD_ERROR_MESSAGE,
              })}
            >
              {clinicServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.service?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.recordDate)}>
            <FormLabel htmlFor="recordDate">Дата</FormLabel>
            <Input
              id="recordDate"
              type="date"
              min={today}
              {...register('recordDate', {
                required: REQUIRED_FIELD_ERROR_MESSAGE,
                min: {
                  value: today,
                  message: 'Не записывайтесь на прошедшие даты',
                },
              })}
            />
            <FormErrorMessage>{errors.recordDate?.message}</FormErrorMessage>
          </FormControl>
        </Box>
        <TimePeriodSelect
          clinicServices={clinicServices}
          control={control}
          getFreeTimePeriodsForDate={getFreeTimePeriodsForDate}
          setValue={setValue}
        />
        <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
          Записаться
        </Button>
      </Box>
    </form>
  )
}
