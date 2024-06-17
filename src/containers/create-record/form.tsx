import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import Link from 'next/link'

import { type UserData } from '@/shared/user'
import { AppRoute } from '@/shared/app'
import { formatDate } from '@/shared/date'

import { isErr, type ServiceDTO } from '@/adapters/domain'
import { ErrorText } from '@/components/error-text'
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
  const {
    setError,
    formState: { errors },
  } = form
  const { mutateAsync: upsertCustomer } = trpc.upsertCustomer.useMutation()
  const queryClient = useQueryClient()
  const { mutateAsync: createAppointment } = trpc.createAppointment.useMutation(
    {
      async onSettled() {
        await queryClient.invalidateQueries({
          queryKey: getQueryKey(trpc.actualRecord),
        })
      },
    }
  )
  const handleCreate = useCallback(
    async ({
      recordDate,
      service,
      recordTime,
      userName,
      userPhone,
    }: FormFields) => {
      try {
        const customerId = await upsertCustomer({
          name: userName,
          email: userData.email ?? '',
          phone: userPhone,
        })
        if (isErr(customerId)) {
          setError('root', {
            message: customerId.error,
          })
          return
        }
        const date = new Date(
          `${recordDate}T${recordTime}`
        )
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        const appointment = await createAppointment({
          appointmentDate: date.toISOString(),
          serviceId: service,
        })
        if (!isErr(appointment)) {
          return
        }
        setError('root', {
          message: appointment.error,
        })
      } catch (error) {
        if (error instanceof Error) {
          setError('root', {
            message: error.message,
          })
        } else {
          setError('root', {
            message: 'Произошла ошибка',
          })
        }
      }
    },
    [upsertCustomer, createAppointment, setError, userData]
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
          {errors.root && <ErrorText text={errors.root.message} />}
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
