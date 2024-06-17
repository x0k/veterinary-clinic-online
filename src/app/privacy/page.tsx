import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

import { queryNotionPage } from '@/server-init'
import { env } from '@/server-env'

export const revalidate = 86400

export default async function PrivacyPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(env.NOTION_PRIVACY_POLICY_PAGE_ID)
  return (
    <MainLayout
      header={<HeaderContainer title="Политика конфиденциальности" />}
    >
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
