import { useMemo } from 'react'

import { ClinicServiceEntity } from '@/models/clinic'
import { OpeningHours, ProductionCalendar, WorkBreaks } from '@/models/schedule'
import { UserData } from '@/models/user'
import { useClinic } from '@/domains/clinic'
import { BigLoader } from '@/components/big-loader'

import { RecordInfo } from './record-info'
import { CreateRecord } from './create-record'

export interface RecordContainerProps {
  sampleRate: number
  userData: UserData
  openingHours: OpeningHours
  productionCalendar: ProductionCalendar
  workBreaks: WorkBreaks
  clinicServices: ClinicServiceEntity[]
}

export function RecordContainer({
  sampleRate,
  userData,
  clinicServices,
  openingHours,
  productionCalendar,
  workBreaks,
}: RecordContainerProps): JSX.Element | null {
  const { isRecordsLoading, clinicRecords } = useClinic()
  const userRecordIndex = useMemo(
    () => clinicRecords.findIndex((r) => r.userId === userData.id),
    [clinicRecords, userData.id]
  )
  const userHasRecord = userRecordIndex > -1
  return isRecordsLoading ? (
    <BigLoader />
  ) : userHasRecord ? (
    <RecordInfo
      record={clinicRecords[userRecordIndex]}
      hasRecordsBefore={userRecordIndex > 0}
    />
  ) : (
    <CreateRecord
      sampleRate={sampleRate}
      clinicServices={clinicServices}
      openingHours={openingHours}
      productionCalendar={productionCalendar}
      userData={userData}
      workBreaks={workBreaks}
    />
  )
}
