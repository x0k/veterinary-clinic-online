import { LogLevel, isErr } from './adapters/domain'
import { createDateTimeLocksRepositoryConfig } from './implementation/kv-date-time-locks-repository-config'
import { createSimpleCacheConfig } from './implementation/kv-simple-cache-config'
import { createWasmDomain } from './implementation/wasm-domain'
import { KVKey } from './kv-key'
import { env } from './server-env'

export const domainPromise = (async () => {
  const domain = await createWasmDomain({
    logger: {
      level: LogLevel.Debug,
    },
    notion: {
      token: env.NOTION_CLIENT_SECRET,
    },
    appointment: {
      notion: {
        breaksDatabaseId: env.NOTION_BREAKS_PAGE_ID,
        customersDatabaseId: env.NOTION_CUSTOMERS_PAGE_ID,
        recordsDatabaseId: env.NOTION_RECORDS_PAGE_ID,
        servicesDatabaseId: env.NOTION_SERVICES_PAGE_ID,
      },
      servicesRepository: {
        cache: createSimpleCacheConfig({
          enabled: true,
          key: KVKey.ServicesCache,
          expireTimeInSeconds: 60 * 60,
        }),
      },
      workBreaksRepository: {
        cache: createSimpleCacheConfig({
          enabled: true,
          key: KVKey.WorkBreaksCache,
          expireTimeInSeconds: 60 * 60,
        }),
      },
      productionCalendar: {
        url: env.PRODUCTION_CALENDAR_URL,
        cache: createSimpleCacheConfig({
          enabled: true,
          key: KVKey.ProductionCalendarCache,
          expireTimeInSeconds: 60 * 60 * 24,
        }),
      },
      schedulingService: {
        sampleRateInMinutes: 30,
      },
      dateTimeLocksRepository: createDateTimeLocksRepositoryConfig({
        dateTimePeriodLocksLockKey: KVKey.DateTimePeriodLocksLock,
        dateTimePeriodLocksPeriodsKey: KVKey.DateTimePeriodLocksPeriods,
        periodsIntersectionChecker(...periods) {
          const result =
            domain.shared.isDateTimePeriodIntersectWithPeriods.apply(
              domain.shared,
              periods
            )
          if (isErr(result)) {
            throw new Error(result.error)
          }
          return result.value
        },
      }),
    },
  })
  return domain
})()
