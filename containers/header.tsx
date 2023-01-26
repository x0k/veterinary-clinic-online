import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Button, Link, Text } from '@chakra-ui/react'

import { AppRoute } from '@/models/app'
import { useUser } from '@/domains/user'
import { Links } from '@/components/links'
import { useAuthentication } from '@/domains/auth'

export function HeaderContainer(): JSX.Element {
  const router = useRouter()
  const user = useUser()
  const { logout } = useAuthentication()
  return (
    <Links
      linkClassName="no-decoration inactive-link"
      activeLinkClassName="no-decoration active-link"
      pathname={router.pathname}
    >
      <Link as={NextLink} href={AppRoute.Home} data-exact>
        Запись
      </Link>
      <Link as={NextLink} href={AppRoute.Services}>
        Услуги
      </Link>
      <Link as={NextLink} href={AppRoute.Info}>
        Информация
      </Link>
      <Box flexGrow="1" />
      {user ? (
        <>
          <Text fontSize="large">{user.name}</Text>
          <Button onClick={logout}>Выйти</Button>
        </>
      ) : null}
    </Links>
  )
}
