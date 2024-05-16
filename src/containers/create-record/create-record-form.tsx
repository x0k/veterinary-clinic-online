import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

import { type UserData } from '@/models/user'
import { AppRoute } from '@/app/model'
import { isErr, type ServiceDTO } from '@/adapters/domain'
import { formatDate } from '@/domains/date'
import { trpc } from '@/client-init'

import { type FormFields } from './model'
import { SimpleFormFields } from './simple-form-fields'
import { TimePeriodSelect } from './time-period-select'

export interface CreateRecordFormProps {
  userData: UserData
  services: ServiceDTO[]
  dayOrNextWorkingDay: string
}

export function CreateRecordForm({
  userData,
  services,
  dayOrNextWorkingDay,
}: CreateRecordFormProps): JSX.Element {
  const formattedDate = useMemo(() => formatDate(new Date(dayOrNextWorkingDay)), [dayOrNextWorkingDay])
  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      service: services[0].id,
      recordDate: formattedDate,
      userName: userData.name,
      userPhone: userData.phone,
    },
    mode: 'onChange',
  })
  const upsertCustomer = trpc.upsertCustomer.useMutation()
  const createAppointment = trpc.createAppointment.useMutation()
  const handleCreate = useCallback(
    async ({ recordDate, service, recordTime, userName, userPhone }: FormFields) => {
      const customerId = await upsertCustomer.mutateAsync({
        name: userName,
        email: userData.email ?? '',
        phone: userPhone,
      })
      if (isErr(customerId)) {
        throw new Error(customerId.error)
      }
      await createAppointment.mutateAsync({
        appointmentDate: 
      })
    },
    [upsertCustomer.mutateAsync, userData]
  )
  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(handleCreate)}
      className="w-full grow flex flex-col"
    >
      <div className="flex flex-col gap-4 max-w-sm mx-auto grow py-4">
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
          errors={errors}
          register={register}
        />
        <button
          type="submit"
          disabled={isSubmitting || isRecordsFetching}
          className="btn btn-primary w-full text-lg"
        >
          Записаться
        </button>
        <Link
          href={AppRoute.Privacy}
          className="text-center link link-hover"
          target="_blank"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </form>
  )
}
