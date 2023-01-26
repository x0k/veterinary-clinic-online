import { useMemo } from 'react'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import axios from 'axios'

import { useUser } from '@/domains/user'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { AuthorizeContainer } from '@/containers/authorize'
import {
  makeProductionCalendar,
  ProductionCalendarData,
  PRODUCTION_CALENDAR_URL,
} from '@/models/schedule'

export interface HomePageProps {
  productionCalendarData: ProductionCalendarData
}

export default function HomePage({
  productionCalendarData,
}: HomePageProps): JSX.Element {
  const user = useUser()
  const productionCalendar = useMemo(
    () => makeProductionCalendar(productionCalendarData),
    [productionCalendarData]
  )
  return (
    <>
      <Head>
        <title>Ветеринарная клиника</title>
        <meta
          name="description"
          content="Учебная ветеринарная клиника АЙБОЛИТ"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout header={<HeaderContainer />}>
        {user ? (
          JSON.stringify(user, null, '\n\n')
        ) : (
          <AuthorizeContainer />
        )}
      </MainLayout>
    </>
  )
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HomePageProps>
> {
  const { data: productionCalendarData } =
    await axios.get<ProductionCalendarData>(PRODUCTION_CALENDAR_URL)
  return {
    props: { productionCalendarData },
  }
}
