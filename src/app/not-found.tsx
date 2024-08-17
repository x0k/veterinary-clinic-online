import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'

import { allowAppointments } from '@/flags'

import { BackButton } from './back-button'

export default async function Page404(): Promise<JSX.Element> {
  const appointments = await allowAppointments()
  return (
    <MainLayout
      header={
        <HeaderContainer
          appointments={appointments}
          title="Страница не найдена"
        />
      }
    >
      <div className="grow flex flex-col justify-center items-center gap-2">
        <p className="text-center text-3xl font-bold">Страница не найдена</p>
        <BackButton />
      </div>
    </MainLayout>
  )
}
