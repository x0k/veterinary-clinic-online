import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'

import { env } from '../env-server'
import { ClientContent } from './client-content'
import { clinicServiceWithRevalidation } from '../init-server'

export default async function HomePage(): Promise<JSX.Element> {
  const response = await fetch(env.PRODUCTION_CALENDAR_URL, {
    next: { revalidate: env.CALENDAR_REVALIDATE_INTERVAL },
  })
  const productionCalendarData = await response.json()
  const clinicServices = await clinicServiceWithRevalidation.fetchServices()
  const dynamicWorkBreaks =
    await clinicServiceWithRevalidation.fetchWorkBreaks()
  return (
    <MainLayout header={<HeaderContainer title="Запись" />}>
      <ClientContent
        clinicServices={clinicServices}
        productionCalendarData={productionCalendarData}
        dynamicWorkBreaks={dynamicWorkBreaks}
      />
    </MainLayout>
  )
}
