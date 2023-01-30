import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { noopPromise } from '@/lib/function'
import {
  Clinic,
  ClinicRecord,
  ClinicRecordCreate,
  ClinicRecordID,
  ClinicRecordStatus,
} from '@/models/clinic'
import { queryKey } from '@/models/app'
import { UserData } from '@/models/user'
import {
  compareDate,
  dateToDateTimeData,
  getTimePeriodDurationInMinutes,
} from '@/models/date'

const ClinicContext = createContext<Clinic>({
  isRecordsLoading: false,
  clinicRecords: [],
  createRecord: noopPromise,
  dismissRecord: noopPromise,
})

export function useClinic(): Clinic {
  return useContext(ClinicContext)
}

export interface ClinicHandlers {
  fetchRecords: () => Promise<ClinicRecord[]>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
  createRecord: (data: ClinicRecordCreate) => Promise<void>
}

export interface ClinicProviderProps {
  userData: UserData
  handlers: ClinicHandlers
  children: ReactNode
}

export function ClinicProvider({
  userData,
  children,
  handlers,
}: ClinicProviderProps): JSX.Element {
  const { data: clinicRecords, isLoading: isRecordsLoading } = useQuery(
    queryKey.clinicRecords,
    handlers.fetchRecords,
    {
      refetchInterval(data) {
        if (!data) {
          return false
        }
        const userRecord = data.find((r) => r.userId === userData.id)
        const now = dateToDateTimeData(new Date())
        if (
          !userRecord ||
          userRecord.status === ClinicRecordStatus.InWork ||
          compareDate(userRecord.dateTimePeriod.start, now) !== 0
        ) {
          return false
        }
        const minutesToStart = getTimePeriodDurationInMinutes({
          start: now,
          end: userRecord.dateTimePeriod.start,
        })
        switch (true) {
          case minutesToStart < -10:
            return false
          case minutesToStart < 3:
            return 10000
          case minutesToStart < 5:
            return 30000
          case minutesToStart < 10:
            return 90000
          case minutesToStart < 30:
            return 300000
          case minutesToStart < 60:
            return 600000
          default:
            return false
        }
      },
    }
  )
  const queryClient = useQueryClient()
  const { mutateAsync: dismissRecord } = useMutation(handlers.dismissRecord, {
    onSuccess(_, recordId) {
      const records = queryClient.getQueryData<ClinicRecord[]>(
        queryKey.clinicRecords
      )
      queryClient.setQueryData(
        queryKey.clinicRecords,
        records?.filter((r) => r.id !== recordId)
      )
    },
  })
  const { mutateAsync: createRecord } = useMutation(handlers.createRecord, {
    onSuccess() {
      void queryClient.invalidateQueries(queryKey.clinicRecords)
    },
  })
  const value: Clinic = useMemo(
    () => ({
      isRecordsLoading,
      clinicRecords: clinicRecords ?? [],
      createRecord,
      dismissRecord,
    }),
    [isRecordsLoading, clinicRecords, dismissRecord, createRecord]
  )
  return createElement(ClinicContext.Provider, { value }, children)
}
