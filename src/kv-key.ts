import { env } from './server-env'

const prefix = env.KV_PREFIX

export const KVKey = {
  DateTimePeriodLocksLock: `${prefix}:dtpsl:lock`,
  DateTimePeriodLocksPeriods: `${prefix}:dtpsl:periods`,
  ServicesCache: `${prefix}:c:services`,
  ServiceCache: `${prefix}:c:service`,
  WorkBreaksCache: `${prefix}:c:work-breaks`,
  ProductionCalendarCache: `${prefix}:c:production-calendar`,
}
