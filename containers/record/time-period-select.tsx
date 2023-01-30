import { useMemo, useEffect } from 'react'
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react'
import { Control, UseFormSetValue, useWatch, Controller } from 'react-hook-form'
import { isValid } from 'date-fns'

import { ClinicServiceEntity } from '@/models/clinic'
import { TimePeriod, timeDataToJSON } from '@/models/date'
import { makeFreeTimePeriodsWithDurationCalculator } from '@/models/schedule'
import { FormFields, REQUIRED_FIELD_ERROR_MESSAGE } from './model'

export interface TimePeriodSelectProps {
  sampleRate: number
  control: Control<FormFields, any>
  clinicServices: ClinicServiceEntity[]
  getFreeTimePeriodsForDate: (date: Date) => TimePeriod[]
  setValue: UseFormSetValue<FormFields>
}

export function TimePeriodSelect({
  sampleRate,
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
      ? makeFreeTimePeriodsWithDurationCalculator(
          service.durationInMinutes,
          sampleRate
        )
      : null
  }, [selectedServiceId, clinicServices, sampleRate])
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
