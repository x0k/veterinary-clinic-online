import { useMemo } from 'react'
import { GetStaticPropsResult } from 'next'
import Head from 'next/head'
import axios from 'axios'
import { Client } from '@notionhq/client'

import { makeRPCClient } from '@/lib/axios-simple-rpc-client'
import { TimePeriod } from '@/models/date'
import {
  makeProductionCalendarWithoutSaturdayWeekend,
  OpeningHours,
  ProductionCalendarData,
  PRODUCTION_CALENDAR_URL,
  WorkBreaks,
} from '@/models/schedule'
import { ClinicServiceEntity } from '@/models/clinic'
import { ApiRoutes, PAGE_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_AUTH } from '@/models/notion'
import { isUserAuthenticated } from '@/models/user'
import { useUser } from '@/domains/user'
import { ClinicProvider } from '@/domains/clinic'
import { MainLayout } from '@/components/main-layout'
import { HeaderContainer } from '@/containers/header'
import { AuthorizeContainer } from '@/containers/authorize'
import { RecordContainer } from '@/containers/record'
import { ClinicService } from '@/implementation/clinic-service'
import { makeClinicHandlers } from '@/adapters/clinic-handlers'

export interface HomePageProps {
  productionCalendarData: ProductionCalendarData
  clinicServices: ClinicServiceEntity[]
}

const weekdayTimePeriod: TimePeriod = {
  start: { hours: 9, minutes: 30 },
  end: { hours: 17, minutes: 0 },
}
const saturdayTimePeriod: TimePeriod = {
  start: weekdayTimePeriod.start,
  end: { hours: 13, minutes: 0 },
}
const openingHours: OpeningHours = {
  1: weekdayTimePeriod,
  2: weekdayTimePeriod,
  3: weekdayTimePeriod,
  4: weekdayTimePeriod,
  5: weekdayTimePeriod,
  6: saturdayTimePeriod,
}
const workBreaks: WorkBreaks = [
  {
    id: 'lunch',
    matchExpression: '^[1-5]',
    title: 'Перерыв на обед',
    period: {
      start: { hours: 13, minutes: 0 },
      end: { hours: 14, minutes: 0 },
    },
  },
]

const clinicHandlers = makeClinicHandlers(makeRPCClient(ApiRoutes.Clinic))

export default function HomePage({
  productionCalendarData,
  clinicServices,
}: HomePageProps): JSX.Element {
  const user = useUser()
  const productionCalendar = useMemo(
    () => makeProductionCalendarWithoutSaturdayWeekend(productionCalendarData),
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
        {isUserAuthenticated(user) ? (
          <ClinicProvider userData={user.userData} handlers={clinicHandlers}>
            <RecordContainer
              userData={user.userData}
              clinicServices={clinicServices}
              openingHours={openingHours}
              productionCalendar={productionCalendar}
              workBreaks={workBreaks}
            />
          </ClinicProvider>
        ) : (
          <AuthorizeContainer />
        )}
      </MainLayout>
    </>
  )
}

const clinicService = new ClinicService(new Client({ auth: NOTION_AUTH }))

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HomePageProps>
> {
  const { data: productionCalendarData } =
    await axios.get<ProductionCalendarData>(PRODUCTION_CALENDAR_URL)
  const clinicServices = await clinicService.fetchServices()
  return {
    props: { productionCalendarData, clinicServices },
    revalidate: PAGE_REVALIDATE_INTERVAL
  }
}
