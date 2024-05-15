import { LogLevel } from './adapters/domain'
import { createDomain } from './implementation/domain'
import { env } from './server-env'
import './vendor/wasm_exec.js'

export const root = await createDomain({
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
  },
})
