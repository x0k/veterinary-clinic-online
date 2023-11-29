import { SERVICES_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_INFO_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'
import { queryNotionPage } from '@/implementation/query-notion-page'

export const revalidate = SERVICES_REVALIDATE_INTERVAL

export default async function InfoPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(NOTION_INFO_PAGE_ID)

  return (
    <MainLayout header={<HeaderContainer title="Информация" />}>
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
