import { type ReactNode, createContext, createElement, useContext } from 'react'
import type { CreateTRPCClient } from '@trpc/client'
import {
  LogLevel,
  type ProductionCalendarDTO,
  type AppConfig,
  type RootDomain,
  type WorkBreakDTO,
  isErr,
} from '@/adapters/domain'
import { useQuery } from '@tanstack/react-query'

import { BigLoader } from '@/components/big-loader'

import type { AppRouter } from '@/implementation/trpc-server'

async function createDomain(config: AppConfig): Promise<RootDomain> {
  const go = new Go()
  const r = await WebAssembly.instantiateStreaming(
    fetch('/domain.wasm'),
    go.importObject
  )
  void go.run(r.instance)
  const result = window.__init_wasm(config)
  if (isErr(result)) {
    return await Promise.reject(result.error)
  }
  return result.value
}

export interface DomainProviderProps {
  sampleRateInMinutes: number
  productionCalendar: ProductionCalendarDTO
  workBreaks: WorkBreakDTO[]
  trpcClient: CreateTRPCClient<AppRouter>
  children: ReactNode
}

const DomainContext = createContext<RootDomain | null>(null)

export function useDomain(): RootDomain {
  const ctx = useContext(DomainContext)
  if (!ctx) {
    throw new Error('useDomain must be used within a DomainProvider')
  }
  return ctx
}

export function DomainProvider({
  sampleRateInMinutes,
  productionCalendar,
  workBreaks,
  trpcClient,
  children,
}: DomainProviderProps): JSX.Element {
  const query = useQuery({
    queryKey: ['domain'],
    queryFn: () =>
      createDomain({
        logger: {
          level: LogLevel.Debug,
        },
        appointment: {
          schedulingService: {
            sampleRateInMinutes,
          },
          productionCalendarRepository: {
            loadProductionCalendar: () => Promise.resolve(productionCalendar),
          },
          workBreaksRepository: {
            loadWorkBreaks: () => Promise.resolve(workBreaks),
          },
          recordsRepository: {
            async createRecord(record) {
              throw new Error('Not implemented')
              // const rec = await trpcClient.createRecord.mutate({
              //   service: record.serviceId,
              // })
              // return record.id
            },
            async loadBusyPeriods(date) {
              console.log('Load busy periods')
              return []
            },
            async loadCustomerActiveAppointment(customerId) {
              return await Promise.reject(new Error('Not implemented'))
            },
            async removeRecord(recordId) {},
          },
          customerRepository: {
            async createCustomer(customer) {
              throw new Error('Not implemented')
            },
            async loadCustomerByIdentity(customerIdentity) {
              throw new Error('Not implemented')
            },
            async updateCustomer(customer) {
              throw new Error('Not implemented')
            },
          },
        },
      }),
  })
  if (query.isPending) {
    return createElement(BigLoader)
  }
  if (query.isError) {
    return createElement(
      'p',
      {
        className: 'text-center text-error',
      },
      query.error.message
    )
  }
  return createElement(
    DomainContext.Provider,
    {
      value: query.data,
    },
    children
  )
}
