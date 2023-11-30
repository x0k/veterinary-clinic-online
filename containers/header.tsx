'use client'
import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
  Text,
} from '@chakra-ui/react'
import { Link } from '@chakra-ui/next-js'
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
  const pathname = usePathname() ?? ''
  const user = useUser()
  const { colorMode, toggleColorMode } = useColorMode()
  const isMobile = useBreakpointValue(
    { base: true, sm: false },
    { fallback: 'sm' }
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const signInButton = isUnauthenticatedUser(user) && (
    <Button
      rightIcon={<FaVk />}
      href={makeAuthenticationLink(AuthenticationType.VK)}
      as={Link}
    >
      Войти
    </Button>
  )
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
                pathname={pathname}
              >
                <Link href={AppRoute.Home} data-exact>
                  Запись
                </Link>
                <Link href={AppRoute.Services}>Услуги</Link>
                <Link href={AppRoute.Info}>Информация</Link>
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
      {signInButton}
    </>
  ) : (
    <>
      <Links
        linkClassName="no-decoration inactive-link"
        activeLinkClassName="no-decoration active-link"
        pathname={pathname}
      >
        <Link href={AppRoute.Home} data-exact>
          Запись
        </Link>
        <Link href={AppRoute.Services}>Услуги</Link>
        <Link href={AppRoute.Info}>Информация</Link>
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
      {signInButton}
    </>
  )
}
