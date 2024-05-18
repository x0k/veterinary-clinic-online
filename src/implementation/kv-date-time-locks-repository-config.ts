import { kv } from '@vercel/kv'

import { type DateTimeLocksRepositoryConfig } from '@/adapters/domain/appointment'
import {
  dateTimePeriodLocksLockKey,
  dateTimePeriodLocksPeriodsKey,
} from '@/kv-key'
import { type DateTimeDTO, type PeriodDTO } from '@/adapters/domain'

export interface CreateDateTimeLocksRepositoryConfigOptions {
  periodsIntersectionChecker: (
    period: PeriodDTO<DateTimeDTO>,
    ...periods: Array<PeriodDTO<DateTimeDTO>>
  ) => boolean
}

export function createDateTimeLocksRepositoryConfig({
  periodsIntersectionChecker,
}: CreateDateTimeLocksRepositoryConfigOptions): DateTimeLocksRepositoryConfig {
  return {
    async lock(period): Promise<void> {
      const [, periods] = await kv
        .multi()
        .set(dateTimePeriodLocksLockKey, '1', {
          nx: true,
        })
        .lrange(dateTimePeriodLocksPeriodsKey, 0, -1)
        .exec()
      try {
        if (
          periods.length > 0 &&
          periodsIntersectionChecker(
            period,
            ...periods.map(
              (period) => JSON.parse(period) as PeriodDTO<DateTimeDTO>
            )
          )
        ) {
          throw new Error('Already locked')
        }
        await kv.lpush(dateTimePeriodLocksPeriodsKey, JSON.stringify(period))
      } finally {
        await kv.del(dateTimePeriodLocksLockKey)
      }
    },
    async unLock(period): Promise<void> {
      // Acquiring the existed lock in `lock` is impossible
      // so it is safe to not check `dateTimePeriodLocksLockKey`
      await kv.lrem(dateTimePeriodLocksPeriodsKey, 0, JSON.stringify(period))
    },
  }
}
