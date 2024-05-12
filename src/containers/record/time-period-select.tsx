import { useMemo, useEffect } from 'react'
import {
  type Control,
  type UseFormSetValue,
  useWatch,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'
import { isValid } from 'date-fns'

import { type ClinicServiceEntity } from '@/models/clinic'
import { type TimePeriod, timeDataToJSON } from '@/models/date'
import { makeFreeTimePeriodsWithDurationCalculator } from '@/models/schedule'

import { REQUIRED_FIELD_ERROR_MESSAGE, type FormFields } from './model'

export interface TimePeriodSelectProps {
  sampleRate: number
  control: Control<FormFields, any>
  clinicServices: ClinicServiceEntity[]
  getFreeTimePeriodsForDate: (date: Date) => TimePeriod[]
  setValue: UseFormSetValue<FormFields>
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
}

export function TimePeriodSelect({
  sampleRate,
  setValue,
  control,
  clinicServices,
  getFreeTimePeriodsForDate,
  errors,
  register,
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
              <p className="text-neutral-content pb-1">
                Дополнительная информация
              </p>
              <p className="text-info">{selectedClinicService.description}</p>
            </div>
          )}
          {selectedClinicService.costDescription && (
            <div>
              <p className="text-neutral-content pb-1">Стоимость</p>
              <p className="text-info">
                {selectedClinicService.costDescription}
              </p>
            </div>
          )}
        </>
      )}
      <p className="text-neutral-content pb-1">Время</p>
      <div className="flex flex-col gap-2">
        {periods.map((p, i) => (
          <div className="form-control" key={periodValues[i]}>
            <label className="label cursor-pointer justify-start gap-4">
              <input
                {...register('recordTime', {
                  required: REQUIRED_FIELD_ERROR_MESSAGE,
                })}
                value={periodValues[i]}
                type="radio"
                className="radio checked:radio-primary"
              />
              <span className="label-text">
                {timeDataToJSON(p.start)} - {timeDataToJSON(p.end)}
              </span>
            </label>
          </div>
        ))}
      </div>
      {errors.recordTime && (
        <div className="label">
          <span className="label-text-alt text-error">
            {errors.recordTime.message}
          </span>
        </div>
      )}
    </>
  )
}
