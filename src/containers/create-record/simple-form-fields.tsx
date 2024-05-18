import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { type FormattedDate } from '@/shared/date'
import { type ServiceDTO } from '@/adapters/domain'

import { type FormFields, REQUIRED_FIELD_ERROR_MESSAGE } from './model'

export interface SimpleFormFieldsProps {
  today: FormattedDate
  services: ServiceDTO[]
}

export function SimpleFormFields({
  today,
  services,
}: SimpleFormFieldsProps): JSX.Element {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormFields>()
  const selectedServiceId = useWatch({
    control,
    name: 'service',
  })
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [selectedServiceId, services]
  )
  return (
    <>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Имя</span>
        </div>
        <input
          aria-invalid={Boolean(errors.userName)}
          id="userName"
          className="input input-bordered invalid:input-error w-full"
          type="text"
          {...register('userName', {
            required: REQUIRED_FIELD_ERROR_MESSAGE,
          })}
        />
        {errors.userName && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.userName.message}
            </span>
          </div>
        )}
      </label>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Телефон</span>
        </div>
        <input
          aria-invalid={Boolean(errors.userPhone)}
          id="userName"
          className="input input-bordered invalid:input-error w-full"
          type="tel"
          {...register('userPhone', {
            required: REQUIRED_FIELD_ERROR_MESSAGE,
          })}
        />
        {errors.userPhone && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.userPhone.message}
            </span>
          </div>
        )}
      </label>
      <div className="flex gap-4">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Услуга</span>
          </div>
          <select
            aria-invalid={Boolean(errors.service)}
            id="service"
            required
            className="select select-bordered w-full invalid:select-error"
            {...register('service', { required: REQUIRED_FIELD_ERROR_MESSAGE })}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.service?.message}
            </span>
          </div>
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Дата</span>
          </div>
          <input
            aria-invalid={Boolean(errors.recordDate)}
            className="input input-bordered invalid:input-error w-full"
            id="recordDate"
            type="date"
            {...register('recordDate', {
              required: REQUIRED_FIELD_ERROR_MESSAGE,
              min: {
                value: today,
                message: 'Прошедшая дата',
              },
            })}
          />
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.recordDate?.message}
            </span>
          </div>
        </label>
      </div>
      {selectedService && (
        <>
          {selectedService.description && (
            <div>
              <p className="text-neutral-content pb-1">
                Дополнительная информация
              </p>
              <p className="text-info">{selectedService.description}</p>
            </div>
          )}
          {selectedService.costDescription && (
            <div>
              <p className="text-neutral-content pb-1">Стоимость</p>
              <p className="text-info">{selectedService.costDescription}</p>
            </div>
          )}
        </>
      )}
    </>
  )
}
