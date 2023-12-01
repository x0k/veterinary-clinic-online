'use client'
import { useRouter } from 'next/navigation'

export function BackButton(): JSX.Element {
  const router = useRouter()
  return (
    <button
      className='btn btn-primary'
      onClick={() => {
        router.back()
      }}
    >
      Вернуться
    </button>
  )
}
