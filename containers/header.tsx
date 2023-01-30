import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Button, IconButton, Link, useColorMode } from '@chakra-ui/react'
import { FaMoon, FaSun } from 'react-icons/fa'

import { AppRoute } from '@/models/app'
import { isUserAuthenticated } from '@/models/user'
import { useUser } from '@/domains/user'
import { Links } from '@/components/links'

export function HeaderContainer(): JSX.Element {
  const router = useRouter()
  const user = useUser()
  const { colorMode, toggleColorMode } = useColorMode()
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
      <Box display="flex" flexDirection="row-reverse" gap="2">
        <IconButton
          aria-label="Color mode switch"
          onClick={toggleColorMode}
          icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
        />
        {isUserAuthenticated(user) && (
          <Button flexGrow="1" onClick={user.logout}>
            Выйти
          </Button>
        )}
      </Box>
    </Links>
  )
}
