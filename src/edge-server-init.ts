import { LogLevel, isErr } from './adapters/domain'
import { createDateTimeLocksRepositoryConfig } from './implementation/kv-date-time-locks-repository-config'
import { createWasmDomain } from './implementation/wasm-domain'
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
      productionCalendar: {
        url: env.PRODUCTION_CALENDAR_URL,
      },
      schedulingService: {
        sampleRateInMinutes: 30,
      },
      dateTimeLocksRepository: createDateTimeLocksRepositoryConfig({
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
