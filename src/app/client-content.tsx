'use client'
import { useMemo } from 'react'

import { BigLoader } from '@/components/big-loader'
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
import { DomainProvider } from '@/domains/domain'
import { useUser } from '@/domains/user'
import { OpeningHoursContainer } from '@/containers/opening-hours'
import { RecordContainer } from '@/containers/record'

import { trpc, trpcClient } from '../init-client'

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
const staticWorkBreaks: WorkBreaks = [
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

export interface ClientContentProps {
  productionCalendarData: ProductionCalendarData
  clinicServices: ClinicServiceEntity[]
  dynamicWorkBreaks: WorkBreaks
}

export function ClientContent({
  clinicServices,
  productionCalendarData,
  dynamicWorkBreaks,
}: ClientContentProps): JSX.Element {
  const user = useUser()
  const productionCalendar = useMemo(
    () => makeProductionCalendarWithoutSaturdayWeekend(productionCalendarData),
    [productionCalendarData]
  )
  const workBreaks = useMemo(
    () => staticWorkBreaks.concat(dynamicWorkBreaks),
    [dynamicWorkBreaks]
  )
  return (
    <DomainProvider
      sampleRateInMinutes={sampleRate}
      productionCalendar={productionCalendarData}
      workBreaks={workBreaks}
      trpcClient={trpcClient}
    >
      {isAuthenticatedUser(user) ? (
        <ClinicProvider userData={user.userData} trpc={trpc}>
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
        <ClinicProvider trpc={trpc}>
          <OpeningHoursContainer />
        </ClinicProvider>
      )}
    </DomainProvider>
  )
}
