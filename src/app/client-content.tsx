'use client'
import { BigLoader } from '@/components/big-loader'
import { isAuthenticatedUser, isInvalidatedUser } from '@/models/user'
import { ClinicProvider } from '@/domains/clinic'
import { useUser } from '@/domains/user'
import { OpeningHoursContainer } from '@/containers/opening-hours'
import { RecordContainer } from '@/containers/record'

import { trpc } from '@/client-init'

export function ClientContent(): JSX.Element {
  const user = useUser()

  return isAuthenticatedUser(user) ? (
    <ClinicProvider userData={user.userData} trpc={trpc}>
      <RecordContainer>
        <p>Create record</p>
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
