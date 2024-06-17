import { BigLoader } from '@/components/big-loader'
import { ErrorText } from '@/components/error-text'
import { isErr } from '@/adapters/domain'

import { trpc } from '@/client-init'

import { RecordInfo } from './record-info'

export interface RecordContainerProps {
  children: React.ReactNode
}

export function RecordContainer({
  children,
}: RecordContainerProps): JSX.Element | null {
  const { isPending, isError, data, error } = trpc.actualRecord.useQuery()
  if (isPending) {
    return <BigLoader />
  }
  if (isError) {
    return <ErrorText text={error.message} />
  }
  if (isErr(data)) {
    return <ErrorText text={data.error} />
  }
  if (data.value === null) {
    return <>{children}</>
  }
  return <RecordInfo appointment={data.value} />
}
