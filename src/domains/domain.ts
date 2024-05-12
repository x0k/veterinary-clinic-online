import { type ReactNode, createContext, createElement, useContext } from 'react'
import {
  LogLevel,
  type RecordsRepositoryConfig,
  type CustomerRepositoryConfig,
  type ProductionCalendarDTO,
  type AppConfig,
  type RootDomain,
  type WorkBreakDTO,
  isErr,
} from '@/adapters/domain'
import { useQuery } from '@tanstack/react-query'

import { BigLoader } from '@/components/big-loader'

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
  recordsRepository: RecordsRepositoryConfig
  customerRepository: CustomerRepositoryConfig
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
  customerRepository,
  recordsRepository,
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
          recordsRepository,
          customerRepository,
        },
      }),
  })
  if (query.isPending) {
    return createElement(BigLoader)
  }
  if (query.isError) {
    const node: ReactNode = query.error.message
    return createElement(
      'p',
      {
        className: 'text-center text-error',
      },
      node
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
