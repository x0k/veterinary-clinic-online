import { AppRoute } from '@/shared/app'

import { MainLayout } from '@/components/main-layout'
import { NotionContent } from '@/components/notion-content'
import { HeaderContainer } from '@/containers/header'

import { queryNotionPage } from '@/server-init'
import { env } from '@/server-env'
import { allowAppointments } from '@/flags'

export const revalidate = 86400

export default async function ServicesPage(): Promise<JSX.Element> {
  const recordMap = await queryNotionPage(env.NOTION_SERVICES_PAGE_ID)
  const appointments = await allowAppointments()
  return (
    <MainLayout
      header={<HeaderContainer appointments={appointments} title="Услуги" />}
    >
      <NotionContent recordMap={recordMap} pageUrlPrefix={AppRoute.Services} />
    </MainLayout>
  )
}
