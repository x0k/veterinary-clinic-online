import Head from 'next/head'
import { GetStaticPropsResult } from 'next'
import type { ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import { NotionAPI } from 'notion-client'
import { useColorMode } from '@chakra-ui/react'

import { NOTION_INFO_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import 'react-notion-x/src/styles.css'

export interface InfoPageProps {
  recordMap: ExtendedRecordMap
}

export default function InfoPage({ recordMap }: InfoPageProps): JSX.Element {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
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
      <MainLayout header={<HeaderContainer />}>
        <NotionRenderer darkMode={isDarkMode} recordMap={recordMap} />
      </MainLayout>
    </>
  )
}

const notion = new NotionAPI()

export async function getStaticProps(): Promise<
  GetStaticPropsResult<InfoPageProps>
> {
  const recordMap = await notion.getPage(NOTION_INFO_PAGE_ID)
  return { props: { recordMap } }
}
