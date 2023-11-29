import { NotionAPI } from 'notion-client'

import { NOTION_PRIVACY_POLICY_PAGE_ID } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

const notion = new NotionAPI()

export default async function PrivacyPage(): Promise<JSX.Element> {
  const recordMap = await notion.getPage(NOTION_PRIVACY_POLICY_PAGE_ID)
  return (
    <MainLayout
      header={<HeaderContainer title="Политика конфиденциальности" />}
    >
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
