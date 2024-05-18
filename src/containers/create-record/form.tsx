import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import Link from 'next/link'

import { ErrorText } from '@/components/error-text'
import { type UserData } from '@/models/user'
import { AppRoute } from '@/shared/app'
import { isErr, type ServiceDTO } from '@/adapters/domain'
import { formatDate } from '@/shared/date'
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
  const formattedDate = useMemo(
    () => formatDate(new Date(dayOrNextWorkingDay)),
    [dayOrNextWorkingDay]
  )
  const form = useForm<FormFields>({
    defaultValues: {
      service: services[0].id,
      recordDate: formattedDate,
      userName: userData.name,
      userPhone: userData.phone,
    },
    mode: 'onChange',
  })
  const { mutateAsync: upsertCustomer } = trpc.upsertCustomer.useMutation()
  const queryClient = useQueryClient()
  const {
    mutateAsync: createAppointment,
    isError,
    error,
  } = trpc.createAppointment.useMutation({
    async onSettled() {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.actualRecord),
      })
    },
  })
  const handleCreate = useCallback(
    async ({
      recordDate,
      service,
      recordTime,
      userName,
      userPhone,
    }: FormFields) => {
      const customerId = await upsertCustomer({
        name: userName,
        email: userData.email ?? '',
        phone: userPhone,
      })
      if (isErr(customerId)) {
        throw new Error(customerId.error)
      }
      const appointment = await createAppointment({
        appointmentDate: new Date(`${recordDate}T${recordTime}`).toISOString(),
        serviceId: service,
      })
      if (isErr(appointment)) {
        throw new Error(appointment.error)
      }
    },
    [upsertCustomer, createAppointment, userData]
  )
  return (
    <FormProvider {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(handleCreate)}
        className="w-full grow flex flex-col"
      >
        <div className="flex flex-col gap-4 max-w-sm mx-auto grow py-4">
          <SimpleFormFields today={formattedDate} services={services} />
          <TimePeriodSelect />
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn btn-primary w-full text-lg"
          >
            Записаться
          </button>
          {isError && <ErrorText text={error.message} />}
          <Link
            href={AppRoute.Privacy}
            className="text-center link link-hover"
            target="_blank"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </form>
    </FormProvider>
  )
}
