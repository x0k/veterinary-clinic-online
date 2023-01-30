import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, Heading, Text, Center } from '@chakra-ui/react'
import { FaVk } from 'react-icons/fa'

import {
  AuthenticationType,
  AUTHENTICATION_ERROR_QUERY_KEY,
  makeAuthenticationLink,
} from '@/models/auth'

export function AuthorizeContainer(): JSX.Element {
  const {
    query: { [AUTHENTICATION_ERROR_QUERY_KEY]: error },
  } = useRouter()
  return (
    <Center height="full" flexDirection="column" gap="2">
      <Heading textAlign="center">Войти</Heading>
      <Button
        leftIcon={<FaVk />}
        href={makeAuthenticationLink(AuthenticationType.VK)}
        as={Link}
      >
        ВКонтакте
      </Button>
      {error && (
        <Text color="red.500">
          {error}
        </Text>
      )}
    </Center>
  )
}
