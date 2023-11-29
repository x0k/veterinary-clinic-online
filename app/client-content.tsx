'use client'
import { useMemo } from 'react'

import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { BigLoader } from '@/components/big-loader'
import { ApiRoutes } from '@/models/app'
import { type ClinicServiceEntity } from '@/models/clinic'
import { type TimePeriod } from '@/models/date'
import {
  type OpeningHours,
  type ProductionCalendarData,
  type WorkBreaks,
  makeProductionCalendarWithoutSaturdayWeekend,
} from '@/models/schedule'
import { isAuthenticatedUser, isInvalidatedUser } from '@/models/user'
import { ClinicProvider } from '@/domains/clinic'
import { useUser } from '@/domains/user'
import { OpeningHoursContainer } from '@/containers/opening-hours'
import { RecordContainer } from '@/containers/record'
import { makeClinicHandlers } from '@/adapters/clinic-handlers'

const weekdayTimePeriod: TimePeriod = {
  start: { hours: 9, minutes: 30 },
  end: { hours: 17, minutes: 0 },
}
const saturdayTimePeriod: TimePeriod = {
  start: weekdayTimePeriod.start,
  end: { hours: 13, minutes: 0 },
}
const openingHours: OpeningHours = {
  1: weekdayTimePeriod,
  2: weekdayTimePeriod,
  3: weekdayTimePeriod,
  4: weekdayTimePeriod,
  5: weekdayTimePeriod,
  6: saturdayTimePeriod,
}
const workBreaks: WorkBreaks = [
  {
    id: 'lunch',
    matchExpression: '^[1-5]',
    title: 'Перерыв на обед',
    period: {
      start: { hours: 12, minutes: 30 },
      end: { hours: 13, minutes: 30 },
    },
  },
]
const sampleRate = 30
const clinicHandlers = makeClinicHandlers(makeRPCClient(ApiRoutes.Clinic))

export interface ClientContentProps {
  productionCalendarData: ProductionCalendarData
  clinicServices: ClinicServiceEntity[]
}

export function ClientContent({
  clinicServices,
  productionCalendarData,
}: ClientContentProps): JSX.Element {
  const user = useUser()
  const productionCalendar = useMemo(
    () => makeProductionCalendarWithoutSaturdayWeekend(productionCalendarData),
    [productionCalendarData]
  )
  return isAuthenticatedUser(user) ? (
    <ClinicProvider userData={user.userData} handlers={clinicHandlers}>
      <RecordContainer
        sampleRate={sampleRate}
        userData={user.userData}
        clinicServices={clinicServices}
        openingHours={openingHours}
        productionCalendar={productionCalendar}
        workBreaks={workBreaks}
      />
    </ClinicProvider>
  ) : isInvalidatedUser(user) ? (
    <BigLoader />
  ) : (
    <ClinicProvider handlers={clinicHandlers}>
      <OpeningHoursContainer
        openingHours={openingHours}
        productionCalendar={productionCalendar}
        sampleRate={sampleRate}
        workBreaks={workBreaks}
      />
    </ClinicProvider>
  )
}
