import { useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'

import { type FormattedDate, formatDate } from '@/shared/date'

import { Schedule } from './schedule'

export function OpeningHoursContainer(): JSX.Element {
  const today = useMemo(() => formatDate(new Date()), [])
  const [selectedDate, setDate] = useState(today)
  return (
    <div className="flex flex-col gap-4 grow py-4 w-full max-w-sm shrink-0">
      <div className="flex items-baseline gap-2">
        <span className="grow">График работы на </span>
        <input
          type="date"
          className="max-w-max input input-bordered input-sm"
          value={selectedDate}
          onChange={(e) => {
            setDate(e.target.value as FormattedDate)
          }}
          min={today}
        />
      </div>
      <p className="text-center">
        Чтобы записаться необходимо{' '}
        <button
          className="btn btn-link btn-sm"
          onClick={() => {
            void signIn()
          }}
        >
          войти
        </button>
      </p>
      <Schedule selectedDate={selectedDate} setDate={setDate} />
    </div>
  )
}
