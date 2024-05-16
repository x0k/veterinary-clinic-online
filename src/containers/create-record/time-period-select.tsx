import { useMemo, useEffect } from 'react'
import {
  type Control,
  type UseFormSetValue,
  useWatch,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'

import { type PeriodDTO, type ServiceIdDTO, type TimeDTO } from '@/adapters/domain'
import { REQUIRED_FIELD_ERROR_MESSAGE, type FormFields } from './model'

export interface TimePeriodSelectProps {
  freeTimePeriods: Array<PeriodDTO<TimeDTO>>
  control: Control<FormFields, any>
  setValue: UseFormSetValue<FormFields>
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
  serviceId: ServiceIdDTO
}

export function TimePeriodSelect({
  setValue,
  control,
  errors,
  register,
  serviceId,
}: TimePeriodSelectProps): JSX.Element {
  const [selectedServiceId, selectedDate] = useWatch({
    name: ['service', 'recordDate'],
    control,
  })
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
