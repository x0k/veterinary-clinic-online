import { redirect } from 'next/navigation'

import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'

// import { env } from '../server-env'
// import { clinicServiceWithRevalidation } from '../server-init'
import { ClientContent } from './client-content'
import { allowAppointments } from '@/flags'

export default async function HomePage(): Promise<JSX.Element> {
  // const response = await fetch(env.PRODUCTION_CALENDAR_URL, {
  //   next: { revalidate: env.CALENDAR_REVALIDATE_INTERVAL },
  // })
  // const productionCalendarData = await response.json()
  // const clinicServices = await clinicServiceWithRevalidation.fetchServices()
  // const dynamicWorkBreaks =
  //   await clinicServiceWithRevalidation.fetchWorkBreaks()
  const appointments = await allowAppointments()
  if (!appointments) {
    redirect('/services')
  }
  return (
    <MainLayout
      header={<HeaderContainer appointments={appointments} title="Запись" />}
    >
      <ClientContent />
    </MainLayout>
  )
}
