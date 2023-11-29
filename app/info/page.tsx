import { NotionAPI } from 'notion-client'

import { NOTION_INFO_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

const notion = new NotionAPI()

export default async function InfoPage(): Promise<JSX.Element> {
  const recordMap = await notion.getPage(NOTION_INFO_PAGE_ID)

  return (
    <MainLayout header={<HeaderContainer title="Информация" />}>
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
