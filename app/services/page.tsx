import { NotionAPI } from 'notion-client'

import { AppRoute } from '@/models/app'
import { NOTION_SERVICES_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

const notion = new NotionAPI()

export default async function ServicesPage(): Promise<JSX.Element> {
  const recordMap = await notion.getPage(NOTION_SERVICES_PAGE_ID)
  return (
    <MainLayout header={<HeaderContainer title="Услуги" />}>
      <NotionContent recordMap={recordMap} pageUrlPrefix={AppRoute.Services} />
    </MainLayout>
  )
}
