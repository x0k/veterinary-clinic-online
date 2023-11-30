import { PRODUCTION_CALENDAR_URL } from '@/models/schedule'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { CALENDAR_REVALIDATE_INTERVAL } from '@/models/app'

import { ClientContent } from './client-content'
import { clinicServiceWithRevalidation } from './init-server'

export default async function HomePage(): Promise<JSX.Element> {
  const response = await fetch(PRODUCTION_CALENDAR_URL, {
    next: { revalidate: CALENDAR_REVALIDATE_INTERVAL },
  })
  const productionCalendarData = await response.json()
  const clinicServices = await clinicServiceWithRevalidation.fetchServices()
  return (
    <MainLayout header={<HeaderContainer title="Запись" />}>
      <ClientContent
        clinicServices={clinicServices}
        productionCalendarData={productionCalendarData}
      />
    </MainLayout>
  )
}
