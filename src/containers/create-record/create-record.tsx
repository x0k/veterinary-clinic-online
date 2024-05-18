import { useMemo } from 'react'

import { type UserData } from '@/models/user'

import { BigLoader } from '@/components/big-loader'
import { ErrorText } from '@/components/error-text'
import { isErr } from '@/adapters/domain'

import { trpc } from '@/client-init'

import { CreateRecordForm } from './form'

export interface CreateRecordProps {
  userData: UserData
}

export function CreateRecord({ userData }: CreateRecordProps): JSX.Element {
  const now = useMemo(() => new Date().toISOString(), [])
  const [services, dayOrNextWorkingDay] = trpc.useQueries((t) => [
    t.services(),
    t.dayOrNextWorkingDay(now),
  ])
  if (services.isPending || dayOrNextWorkingDay.isPending) {
    return <BigLoader />
  }
  if (services.isError) {
    return <ErrorText text={services.error.message} />
  }
  if (dayOrNextWorkingDay.isError) {
    return <ErrorText text={dayOrNextWorkingDay.error.message} />
  }
  if (isErr(services.data)) {
    return <ErrorText text={services.data.error} />
  }
  if (isErr(dayOrNextWorkingDay.data)) {
    return <ErrorText text={dayOrNextWorkingDay.data.error} />
  }
  return (
    <CreateRecordForm
      userData={userData}
      dayOrNextWorkingDay={dayOrNextWorkingDay.data.value}
      services={services.data.value}
    />
  )
}
