import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react'

import { ClinicData, ClinicRecord } from '@/models/clinic'
import { useQuery } from 'react-query'
import { queryKey } from '@/models/app'

const ClinicContext = createContext<ClinicData>({
  clinicRecords: [],
})

export function useClinic(): ClinicData {
  return useContext(ClinicContext)
}

export interface ClinicHandlers {
  fetchRecords: () => Promise<ClinicRecord[]>
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
    handlers.fetchRecords,
    {
      initialData: [],
    }
  )
  const value: ClinicData = useMemo(
    () => ({
      clinicRecords: clinicRecords as ClinicRecord[],
    }),
    [clinicRecords]
  )
  return createElement(ClinicContext.Provider, { value }, children)
}
