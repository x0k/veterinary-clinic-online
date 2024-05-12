import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey, type CreateTRPCReact } from '@trpc/react-query'

import { dateId } from '@/lib/date-id'
import { noopPromise } from '@/lib/function'
import {
  type Clinic,
  type ClinicRecord,
  type ClinicRecordID,
  ClinicRecordStatus,
} from '@/models/clinic'
import { type UserId, type UserData } from '@/models/user'
import {
  compareDate,
  dateTimePeriodsAPI,
  dateToDateTimeData,
  getTimePeriodDurationInMinutes,
  makeDateTimeShifter,
} from '@/models/date'

import type { AppRouter } from '@/implementation/trpc-server'

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

export interface ClinicProviderProps {
  userData?: UserData
  children: ReactNode
  trpc: CreateTRPCReact<AppRouter, unknown>
}

const shiftToMoscowTZ = makeDateTimeShifter({
  hours: 3,
})

export function ClinicProvider({
  userData,
  children,
  trpc,
}: ClinicProviderProps): JSX.Element {
  const {
    data: clinicRecords,
    isLoading: isRecordsLoading,
    isFetching: isRecordsFetching,
  } = trpc.fetchActualRecords.useQuery(undefined, {
    refetchInterval({ state: { data } }) {
      if (!data || !userData) {
        return false
      }
      const userRecord = data.find((r) => r.userId === userData.id)
      const now = dateToDateTimeData(new Date())
      if (
        !userRecord ||
        userRecord.status !== ClinicRecordStatus.Awaits ||
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
  const { mutateAsync: dismissRecord, isPending: isDismissRecordLoading } =
    trpc.dismissRecord.useMutation({
      async onMutate(recordId) {
        const recordsKey = getQueryKey(trpc.fetchActualRecords)
        await queryClient.cancelQueries({ queryKey: recordsKey })
        const previousRecords =
          queryClient.getQueryData<ClinicRecord[]>(recordsKey)
        queryClient.setQueryData<ClinicRecord[] | undefined>(
          recordsKey,
          (records) => records?.filter((r) => r.id !== recordId)
        )
        return { previousRecords }
      },
      onError(error, _, context) {
        if (context && 'previousRecords' in context) {
          queryClient.setQueryData(
            getQueryKey(trpc.fetchActualRecords),
            context.previousRecords
          )
        }
        console.error(error)
        // toast({
        //   status: 'error',
        //   title: 'Ошибка при отмене записи',
        //   description: error instanceof Error ? error.message : undefined,
        // })
      },
      async onSettled() {
        await queryClient.invalidateQueries({
          queryKey: getQueryKey(trpc.fetchActualRecords),
        })
      },
    })
  const { mutateAsync: createRecord, isPending: isCreateRecordLoading } =
    trpc.createRecord.useMutation({
      async onMutate({ identity, utcDateTimePeriod }) {
        const recordsKey = getQueryKey(trpc.fetchActualRecords)
        await queryClient.cancelQueries({ queryKey: recordsKey })
        const previousRecords =
          queryClient.getQueryData<ClinicRecord[]>(recordsKey)
        queryClient.setQueryData<ClinicRecord[] | undefined>(
          recordsKey,
          (records = []) =>
            records
              .concat({
                id: dateId() as ClinicRecordID,
                status: ClinicRecordStatus.Awaits,
                userId: identity as UserId,
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
            getQueryKey(trpc.fetchActualRecords),
            context.previousRecords
          )
        }
        console.error(error)
        // toast({
        //   status: 'error',
        //   title: 'Ошибка при создании записи',
        //   description: error instanceof Error ? error.message : undefined,
        // })
      },
      async onSettled() {
        await queryClient.invalidateQueries({
          queryKey: getQueryKey(trpc.fetchActualRecords),
        })
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
