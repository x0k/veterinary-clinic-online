import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { BackButton } from './back-button'

export default function Page404(): JSX.Element {
  return (
    <MainLayout header={<HeaderContainer title="Страница не найдена" />}>
      <div className="grow flex flex-col justify-center items-center gap-2">
        <p className="text-center text-3xl font-bold">Страница не найдена</p>
        <BackButton />
      </div>
    </MainLayout>
  )
}
