import { SERVICES_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_PRIVACY_POLICY_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'
import { queryNotionPage } from '@/implementation/query-notion-page'

export const revalidate = SERVICES_REVALIDATE_INTERVAL

export default async function PrivacyPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(NOTION_PRIVACY_POLICY_PAGE_ID)
  return (
    <MainLayout
      header={<HeaderContainer title="Политика конфиденциальности" />}
    >
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
