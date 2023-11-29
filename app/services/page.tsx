import { AppRoute, SERVICES_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_SERVICES_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'
import { queryNotionPage } from '@/implementation/query-notion-page'

export const revalidate = SERVICES_REVALIDATE_INTERVAL

export default async function ServicesPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(NOTION_SERVICES_PAGE_ID)
  return (
    <MainLayout header={<HeaderContainer title="Услуги" />}>
      <NotionContent recordMap={recordMap} pageUrlPrefix={AppRoute.Services} />
    </MainLayout>
  )
}
