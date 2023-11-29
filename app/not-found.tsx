import { Center, Heading } from '@chakra-ui/react'

import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { BackButton } from './back-button'

export default function Page404(): JSX.Element {
  return (
    <MainLayout header={<HeaderContainer title="Страница не найдена" />}>
      <Center minHeight="inherit" flexDirection="column" gap="2">
        <Heading textAlign="center">Страница не найдена</Heading>
        <BackButton />
      </Center>
    </MainLayout>
  )
}
