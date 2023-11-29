import { Client } from '@notionhq/client'

import { PRODUCTION_CALENDAR_URL } from '@/models/schedule'
import { NOTION_AUTH } from '@/models/notion'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { ClinicService } from '@/implementation/clinic-service'
import {
  CALENDAR_REVALIDATE_INTERVAL,
  SERVICES_REVALIDATE_INTERVAL,
} from '@/models/app'

import { ClientContent } from './client-content'

const clinicService = new ClinicService(
  new Client({
    auth: NOTION_AUTH,
    fetch: (url, init) =>
      fetch(url, { ...init, next: { revalidate: SERVICES_REVALIDATE_INTERVAL } }),
  })
)

export default async function HomePage(): Promise<JSX.Element> {
  const response = await fetch(PRODUCTION_CALENDAR_URL, {
    next: { revalidate: CALENDAR_REVALIDATE_INTERVAL },
  })
  const productionCalendarData = await response.json()
  const clinicServices = await clinicService.fetchServices()
  return (
    <MainLayout header={<HeaderContainer title="Запись" />}>
      <ClientContent
        clinicServices={clinicServices}
        productionCalendarData={productionCalendarData}
      />
    </MainLayout>
  )
}
