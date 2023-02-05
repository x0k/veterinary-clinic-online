import { ReactNode } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Link,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { FaMoon, FaSun, FaSignOutAlt, FaBars, FaVk } from 'react-icons/fa'

import { AppRoute } from '@/models/app'
import { isAuthenticatedUser, isUnauthenticatedUser } from '@/models/user'
import { makeAuthenticationLink, AuthenticationType } from '@/models/auth'
import { useUser } from '@/domains/user'
import { Links } from '@/components/links'

export interface HeaderContainerProps {
  title: ReactNode
}

export function HeaderContainer({ title }: HeaderContainerProps): JSX.Element {
  const router = useRouter()
  const user = useUser()
  const { colorMode, toggleColorMode } = useColorMode()
  const isMobile = useBreakpointValue(
    { base: true, sm: false },
    { fallback: 'sm' }
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  return isMobile ? (
    <>
      <IconButton
        aria-label="Open main navigation"
        onClick={onOpen}
        icon={<FaBars />}
      />
      <Text noOfLines={1}>{title}</Text>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Навигация</DrawerHeader>
          <DrawerBody>
            <Box display="flex" flexDirection="column" gap="2" fontSize="xl">
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
              </Links>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Box flexGrow="1" />
      <IconButton
        aria-label="Color mode switch"
        onClick={toggleColorMode}
        icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
      />
      {isAuthenticatedUser(user) && (
        <IconButton
          aria-label="Sign out"
          onClick={user.logout}
          icon={<FaSignOutAlt />}
        />
      )}
      {isUnauthenticatedUser(user) && (
        <IconButton
          aria-label="Sign in"
          as={NextLink}
          icon={<FaVk />}
          href={makeAuthenticationLink(AuthenticationType.VK)}
        />
      )}
    </>
  ) : (
    <>
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
      </Links>
      <Box flexGrow="1" />
      <IconButton
        aria-label="Color mode switch"
        onClick={toggleColorMode}
        icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
      />
      {isAuthenticatedUser(user) && (
        <Button onClick={user.logout}>Выйти</Button>
      )}
      {isUnauthenticatedUser(user) && (
        <Button
          rightIcon={<FaVk />}
          href={makeAuthenticationLink(AuthenticationType.VK)}
          as={NextLink}
        >
          Войти
        </Button>
      )}
    </>
  )
}
