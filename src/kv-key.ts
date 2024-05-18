import { env } from './server-env'

const prefix = env.KV_PREFIX

export const dateTimePeriodLocksLockKey = `${prefix}:dtpsl:lock`
export const dateTimePeriodLocksPeriodsKey = `${prefix}:dtpsl:periods`
