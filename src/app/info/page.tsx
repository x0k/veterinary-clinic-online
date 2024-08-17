import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

import { queryNotionPage } from '@/server-init'
import { env } from '@/server-env'
import { allowAppointments } from '@/flags'

export const revalidate = 86400

export default async function InfoPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(env.NOTION_INFO_PAGE_ID)
  const appointments = await allowAppointments()
  return (
    <MainLayout
      header={
        <HeaderContainer appointments={appointments} title="Информация" />
      }
    >
      <NotionContent recordMap={recordMap} />
    </MainLayout>
  )
}
