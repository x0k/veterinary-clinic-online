'use client'
import { BigLoader } from '@/components/big-loader'
import { isAuthenticatedUser, isInvalidatedUser } from '@/models/user'
import { ClinicProvider } from '@/shared/clinic'
import { useUser } from '@/shared/user'
import { OpeningHoursContainer } from '@/containers/opening-hours'
import { RecordContainer } from '@/containers/record'

import { trpc } from '@/client-init'
import { CreateRecord } from '@/containers/create-record'

export function ClientContent(): JSX.Element {
  const user = useUser()
  return isAuthenticatedUser(user) ? (
    <ClinicProvider userData={user.userData} trpc={trpc}>
      <RecordContainer>
        <CreateRecord userData={user.userData} />
      </RecordContainer>
    </ClinicProvider>
  ) : isInvalidatedUser(user) ? (
    <BigLoader />
  ) : (
    <ClinicProvider trpc={trpc}>
      <OpeningHoursContainer />
    </ClinicProvider>
  )
}
