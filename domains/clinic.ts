import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import { noop } from '@/lib/function'
import { Clinic, ClinicRecord, ClinicRecordID } from '@/models/clinic'
import { queryKey } from '@/models/app'

const ClinicContext = createContext<Clinic>({
  clinicRecords: [],
  dismissRecord: noop,
})

export function useClinic(): Clinic {
  return useContext(ClinicContext)
}

export interface ClinicHandlers {
  fetchRecords: () => Promise<ClinicRecord[]>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
}

export interface ClinicProviderProps {
  handlers: ClinicHandlers
  children: ReactNode
}

export function ClinicProvider({
  children,
  handlers,
}: ClinicProviderProps): JSX.Element {
  const { data: clinicRecords } = useQuery(
    queryKey.clinicRecords,
    handlers.fetchRecords
  )
  const queryClient = useQueryClient()
  const { mutate: dismissRecord } = useMutation(handlers.dismissRecord, {
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
  const value: Clinic = useMemo(
    () => ({
      clinicRecords: clinicRecords ?? [],
      dismissRecord,
    }),
    [clinicRecords, dismissRecord]
  )
  return createElement(ClinicContext.Provider, { value }, children)
}
