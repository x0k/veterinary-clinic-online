import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

import { queryNotionPage } from '../init-server'
import { env } from '../env-server'

export const revalidate = 86400

export default async function InfoPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(env.NOTION_INFO_PAGE_ID)

  return (
    <MainLayout header={<HeaderContainer title="Информация" />}>
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
