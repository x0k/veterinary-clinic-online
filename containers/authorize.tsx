import Link from 'next/link'
import { useRouter } from 'next/router'
import { Box, Button, Heading, Text } from '@chakra-ui/react'

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
    <Box
      display="flex"
      height="full"
      flexDirection="column"
      alignItems="stretch"
      justifyContent="center"
      gap="2"
      maxW="sm"
      marginX="auto"
    >
      <Heading textAlign="center">Войти</Heading>
      <Button href={makeAuthenticationLink(AuthenticationType.VK)} as={Link}>
        VK
      </Button>
      <Button
        href={makeAuthenticationLink(AuthenticationType.Google)}
        as={Link}
      >
        Google
      </Button>
      {error && (
        <Text textAlign="center" color="red.500">
          {error}
        </Text>
      )}
    </Box>
  )
}
