import { Client as NotionClient } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { cache } from 'react'

import { ClinicService } from '@/implementation/clinic-service'

import { env } from './env-server'

export const clinicServiceWithRevalidation = new ClinicService(
  new NotionClient({
    auth: env.NOTION_CLIENT_SECRET,
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        next: { revalidate: env.SERVICES_REVALIDATE_INTERVAL },
      }),
  }),
  env.NOTION_SERVICES_PAGE_ID,
  env.NOTION_RECORDS_PAGE_ID,
  env.NOTION_BREAKS_PAGE_ID,
)

export const clinicService = new ClinicService(
  new NotionClient({
    auth: env.NOTION_CLIENT_SECRET,
  }),
  env.NOTION_SERVICES_PAGE_ID,
  env.NOTION_RECORDS_PAGE_ID,
  env.NOTION_BREAKS_PAGE_ID,
)

const notion = new NotionAPI()

export const queryNotionPage = cache((pageId: string) => notion.getPage(pageId))
