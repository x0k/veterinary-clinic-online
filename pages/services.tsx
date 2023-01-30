import Head from 'next/head'
import { GetStaticPropsResult } from 'next'
import type { ExtendedRecordMap } from 'notion-types'
import { NotionComponents, NotionRenderer } from 'react-notion-x'
import { NotionAPI } from 'notion-client'
import dynamic from 'next/dynamic'
import { useColorMode } from '@chakra-ui/react'
import 'react-notion-x/src/styles.css'

import { AppRoute, PAGE_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_SERVICES_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'

export interface InfoPageProps {
  recordMap: ExtendedRecordMap
}

function mapServicesPageIdToURL(pageId: string): string {
  return `${AppRoute.Services}/${pageId}`
}

const Collection = dynamic(async () => {
  const { Collection } = await import(
    'react-notion-x/build/third-party/collection'
  )
  return Collection
})

const notionComponents: Partial<NotionComponents> = {
  Collection,
}

export default function ServicesPage({
  recordMap,
}: InfoPageProps): JSX.Element {
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
      <MainLayout header={<HeaderContainer title="Услуги" />}>
        <NotionRenderer
          darkMode={isDarkMode}
          recordMap={recordMap}
          components={notionComponents}
          mapPageUrl={mapServicesPageIdToURL}
          linkTableTitleProperties={false}
        />
      </MainLayout>
    </>
  )
}

const notion = new NotionAPI()

export async function getStaticProps(): Promise<
  GetStaticPropsResult<InfoPageProps>
> {
  const recordMap = await notion.getPage(NOTION_SERVICES_PAGE_ID)
  return { props: { recordMap }, revalidate: PAGE_REVALIDATE_INTERVAL }
}
