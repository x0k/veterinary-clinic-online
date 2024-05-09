import {
  LogLevel,
  type ProductionCalendarDTO,
  type AppConfig,
  type RootDomain,
  type WorkBreakDTO,
} from '@/adapters/domain'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'

export async function createDomain(config: AppConfig): Promise<RootDomain> {
  const go = new Go()
  const r = await WebAssembly.instantiateStreaming(
    fetch('/domain.wasm'),
    go.importObject
  )
  void go.run(r.instance)
  return await window.__init_wasm(config)
}

export interface DomainConfig {
  sampleRateInMinutes: number
  productionCalendar: ProductionCalendarDTO
  workBreaks: WorkBreakDTO[]
}

export function useDomain({
  sampleRateInMinutes,
  productionCalendar,
  workBreaks
}: DomainConfig): UseQueryResult<RootDomain> {
  return useQuery({
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
              return record.id
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
        },
      }),
  })
}
