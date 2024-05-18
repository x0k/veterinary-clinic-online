'use client'
import { BigLoader } from '@/components/big-loader'
import { isAuthenticatedUser, isInvalidatedUser } from '@/shared/user'
import { useUser } from '@/adapters/user'
import { OpeningHoursContainer } from '@/containers/opening-hours'
import { RecordContainer } from '@/containers/record'

import { CreateRecord } from '@/containers/create-record'

export function ClientContent(): JSX.Element {
  const user = useUser()
  return isAuthenticatedUser(user) ? (
    <RecordContainer>
      <CreateRecord userData={user.userData} />
    </RecordContainer>
  ) : isInvalidatedUser(user) ? (
    <BigLoader />
  ) : (
    <OpeningHoursContainer />
  )
}
