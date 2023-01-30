import { useMemo } from 'react'
import { Center, CircularProgress } from '@chakra-ui/react'

import { ClinicServiceEntity } from '@/models/clinic'
import { OpeningHours, ProductionCalendar, WorkBreaks } from '@/models/schedule'
import { UserData } from '@/models/user'
import { useClinic } from '@/domains/clinic'

import { RecordInfo } from './record-info'
import { CreateRecord } from './create-record'

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
  const { isRecordsLoading, isRecordsFetching, clinicRecords, dismissRecord, createRecord } =
    useClinic()
  const userRecordIndex = useMemo(
    () => clinicRecords.findIndex((r) => r.userId === userData.id),
    [clinicRecords, userData.id]
  )
  const userHasRecord = userRecordIndex > -1
  return isRecordsLoading ? (
    <Center height="full">
      <CircularProgress isIndeterminate color="teal.500" size="8rem" />
    </Center>
  ) : userHasRecord ? (
    <RecordInfo
      isRecordsFetching={isRecordsFetching}
      record={clinicRecords[userRecordIndex]}
      hasRecordsBefore={userRecordIndex > 0}
      dismissRecord={dismissRecord}
    />
  ) : (
    <CreateRecord
      isRecordsFetching={isRecordsFetching}
      clinicRecords={clinicRecords}
      clinicServices={clinicServices}
      openingHours={openingHours}
      productionCalendar={productionCalendar}
      userData={userData}
      workBreaks={workBreaks}
      createRecord={createRecord}
    />
  )
}
