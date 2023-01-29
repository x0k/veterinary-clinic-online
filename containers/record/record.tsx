import { useMemo } from 'react'

import { ClinicServiceEntity } from '@/models/clinic'
import {
  makeDayFreeTimePeriodsCalculator,
  OpeningHours,
  ProductionCalendar,
  WorkBreaks,
} from '@/models/schedule'
import { UserData } from '@/models/user'
import { useClinic } from '@/domains/clinic'

export interface RecordContainerProps {
  userData: UserData
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
  clinicServices: ClinicServiceEntity[]
}

export function RecordContainer({
  userData,
  clinicServices,
  openingHours,
  productionCalendar,
  workBreaks,
}: RecordContainerProps): JSX.Element | null {
  const { clinicRecords } = useClinic()
  const busyPeriods = useMemo(
    () => clinicRecords.map((r) => r.dateTimePeriod),
    [clinicRecords]
  )
  const getFreeTimePeriodsForDate = useMemo(
    () =>
      makeDayFreeTimePeriodsCalculator({
        openingHours,
        busyPeriods,
        productionCalendar,
        workBreaks,
      }),
    [openingHours, busyPeriods, productionCalendar, workBreaks]
  )
  const userRecord = useMemo(
    () => clinicRecords.find((r) => r.userId === userData.id),
    [clinicRecords, userData.id]
  )
  return null
}
