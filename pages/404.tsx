import Head from 'next/head'
import { Button, Center, Heading } from '@chakra-ui/react'

import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'

export default function Page404(): JSX.Element {
  return (
    <>
      <Head>
        <title>Ветеринарная клиника</title>
        <meta
          name="description"
          content="Учебная ветеринарная клиника АЙБОЛИТ"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout header={<HeaderContainer title="Страница не найдена" />}>
        <Center minHeight="inherit" flexDirection="column" gap="2">
          <Heading textAlign="center">Страница не найдена</Heading>
          <Button
            colorScheme="teal"
            onClick={() => {
              window.history.back()
            }}
          >
            Вернуться
          </Button>
        </Center>
      </MainLayout>
    </>
  )
}
