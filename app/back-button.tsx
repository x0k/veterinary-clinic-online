'use client'
import { Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export function BackButton(): JSX.Element {
  const router = useRouter()
  return (
    <Button
      colorScheme="teal"
      onClick={() => {
        router.back()
      }}
    >
      Вернуться
    </Button>
  )
}
