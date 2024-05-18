import { useEffect } from 'react'
import { useWatch, useFormContext } from 'react-hook-form'

import { isErr, ok } from '@/adapters/domain'
import { REQUIRED_FIELD_ERROR_MESSAGE, type FormFields } from './model'
import { trpc } from '@/client-init'
import { BigLoader } from '@/components/big-loader'
import { ErrorText } from '@/components/error-text'
import { formatTime, toIsoDate } from '@/shared/date'

export function TimePeriodSelect(): JSX.Element {
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<FormFields>()
  const [selectedServiceId, selectedDate] = useWatch({
    control,
    name: ['service', 'recordDate'],
  })
  const { isPending, isError, data, error } = trpc.freeTimeSlots.useQuery(
    {
      serviceId: selectedServiceId,
      appointmentDate: toIsoDate(selectedDate),
    },
    {
      enabled: Boolean(selectedServiceId && selectedDate),
      initialData: ok([]),
    }
  )
  useEffect(() => {
    setValue('recordTime', '')
  }, [data, setValue])
  if (isPending) {
    return <BigLoader />
  }
  if (isError) {
    return <ErrorText text={error.message} />
  }
  if (isErr(data)) {
    return <ErrorText text={data.error} />
  }
  const { value: slots } = data
  return (
    <>
      {/* {selectedClinicService && (
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
      )} */}
      <p className="text-neutral-content pb-1">Время</p>
      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const formatted = formatTime(slot.start)
          return (
            <div className="form-control" key={formatted}>
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  {...register('recordTime', {
                    required: REQUIRED_FIELD_ERROR_MESSAGE,
                  })}
                  value={formatted}
                  type="radio"
                  className="radio checked:radio-primary"
                />
                <span className="label-text">
                  {formatted} - {formatTime(slot.end)}
                </span>
              </label>
            </div>
          )
        })}
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
