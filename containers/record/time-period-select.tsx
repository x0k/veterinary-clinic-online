import { useMemo, useEffect } from 'react'
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react'
import {
  type Control,
  type UseFormSetValue,
  useWatch,
  Controller,
} from 'react-hook-form'
import { isValid } from 'date-fns'

import { type ClinicServiceEntity } from '@/models/clinic'
import { type TimePeriod, timeDataToJSON } from '@/models/date'
import { makeFreeTimePeriodsWithDurationCalculator } from '@/models/schedule'

import { type FormFields, REQUIRED_FIELD_ERROR_MESSAGE } from './model'

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
  const selectedClinicService = useMemo(
    () =>
      selectedServiceId &&
      clinicServices.find((s) => s.id === selectedServiceId),
    [selectedServiceId, clinicServices]
  )
  const getTimePeriodsForService = useMemo(() => {
    return selectedClinicService
      ? makeFreeTimePeriodsWithDurationCalculator(
          selectedClinicService.durationInMinutes,
          sampleRate
        )
      : null
  }, [selectedClinicService, sampleRate])
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
    <>
      {selectedClinicService && (
        <>
          {selectedClinicService.description && (
            <div>
              <Text>Дополнительная информация</Text>
              <Text color="GrayText">{selectedClinicService.description}</Text>
            </div>
          )}
          {selectedClinicService.costDescription && (
            <div>
              <Text>Стоимость</Text>
              <Text color="GrayText">
                {selectedClinicService.costDescription}
              </Text>
            </div>
          )}
        </>
      )}
      <Controller
        control={control}
        name="recordTime"
        rules={{ required: REQUIRED_FIELD_ERROR_MESSAGE }}
        render={({ field, fieldState: { invalid, error } }) => (
          <FormControl isRequired isInvalid={invalid}>
            <FormLabel htmlFor="recordTime">Время</FormLabel>
            <RadioGroup id="recordTime" {...field}>
              <div className="flex flex-col gap-4">
                {periods.map((p, i) => (
                  <Radio key={periodValues[i]} value={periodValues[i]}>
                    {timeDataToJSON(p.start)} - {timeDataToJSON(p.end)}
                  </Radio>
                ))}
              </div>
            </RadioGroup>
            <FormErrorMessage>{error?.message}</FormErrorMessage>
          </FormControl>
        )}
      />
    </>
  )
}
