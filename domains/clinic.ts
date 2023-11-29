import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useToast } from '@chakra-ui/react'

import { dateId } from '@/lib/date-id'
import { noopPromise } from '@/lib/function'
import {
  type Clinic,
  type ClinicRecord,
  type ClinicRecordCreate,
  type ClinicRecordID,
  ClinicRecordStatus,
} from '@/models/clinic'
import { queryKey } from '@/models/app'
import { type UserData } from '@/models/user'
import {
  compareDate,
  dateTimePeriodsAPI,
  dateToDateTimeData,
  getTimePeriodDurationInMinutes,
  makeDateTimeShifter,
} from '@/models/date'

const ClinicContext = createContext<Clinic>({
  isRecordsLoading: false,
  isRecordsFetching: false,
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
  userData?: UserData
  handlers: ClinicHandlers
  children: ReactNode
}

const shiftToMoscowTZ = makeDateTimeShifter({
  hours: 3,
})

export function ClinicProvider({
  userData,
  children,
  handlers,
}: ClinicProviderProps): JSX.Element {
  const {
    data: clinicRecords,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
  } = useQuery(queryKey.clinicRecords, handlers.fetchRecords, {
    refetchInterval(data) {
      if (!data || !userData) {
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
  })
  const queryClient = useQueryClient()
  const toast = useToast({
    position: 'bottom-right',
  })
  const { mutateAsync: dismissRecord, isLoading: isDismissRecordLoading } =
    useMutation(handlers.dismissRecord, {
      async onMutate(recordId) {
        await queryClient.cancelQueries(queryKey.clinicRecords)
        const previousRecords = queryClient.getQueryData<ClinicRecord[]>(
          queryKey.clinicRecords
        )
        queryClient.setQueryData<ClinicRecord[] | undefined>(
          queryKey.clinicRecords,
          (records) => records?.filter((r) => r.id !== recordId)
        )
        return { previousRecords }
      },
      onError(error, _, context) {
        if (context && 'previousRecords' in context) {
          queryClient.setQueryData(
            queryKey.clinicRecords,
            context.previousRecords
          )
        }
        toast({
          status: 'error',
          title: 'Ошибка при отмене записи',
          description: error instanceof Error ? error.message : undefined,
        })
      },
      async onSettled() {
        await queryClient.invalidateQueries(queryKey.clinicRecords)
      },
    })
  const { mutateAsync: createRecord, isLoading: isCreateRecordLoading } =
    useMutation(handlers.createRecord, {
      async onMutate({ identity, utcDateTimePeriod }) {
        await queryClient.cancelQueries(queryKey.clinicRecords)
        const previousRecords = queryClient.getQueryData<ClinicRecord[]>(
          queryKey.clinicRecords
        )
        queryClient.setQueryData<ClinicRecord[] | undefined>(
          queryKey.clinicRecords,
          (records = []) =>
            records
              .concat({
                id: dateId() as ClinicRecordID,
                status: ClinicRecordStatus.Awaits,
                userId: identity,
                dateTimePeriod: {
                  start: shiftToMoscowTZ(utcDateTimePeriod.start),
                  end: shiftToMoscowTZ(utcDateTimePeriod.end),
                },
              })
              .sort((a, b) =>
                dateTimePeriodsAPI.comparePeriods(
                  a.dateTimePeriod,
                  b.dateTimePeriod
                )
              )
        )
        return { previousRecords }
      },
      onError(error, _, context) {
        if (context && 'previousRecords' in context) {
          queryClient.setQueryData(
            queryKey.clinicRecords,
            context.previousRecords
          )
        }
        toast({
          status: 'error',
          title: 'Ошибка при создании записи',
          description: error instanceof Error ? error.message : undefined,
        })
      },
      async onSettled() {
        await queryClient.invalidateQueries(queryKey.clinicRecords)
      },
    })
  const value: Clinic = useMemo(
    () => ({
      isRecordsLoading,
      isRecordsFetching:
        isRecordsFetching || isDismissRecordLoading || isCreateRecordLoading,
      clinicRecords: clinicRecords ?? [],
      createRecord,
      dismissRecord,
    }),
    [
      isRecordsLoading,
      isRecordsFetching,
      isDismissRecordLoading,
      isCreateRecordLoading,
      clinicRecords,
      dismissRecord,
      createRecord,
    ]
  )
  return createElement(ClinicContext.Provider, { value }, children)
}
