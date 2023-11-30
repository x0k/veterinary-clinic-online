import { Client as NotionClient } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { cache } from 'react'

import { SERVICES_REVALIDATE_INTERVAL } from '@/models/app'
import { NOTION_AUTH } from '@/models/notion'
import { ClinicService } from '@/implementation/clinic-service'

export const clinicServiceWithRevalidation = new ClinicService(
  new NotionClient({
    auth: NOTION_AUTH,
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        next: { revalidate: SERVICES_REVALIDATE_INTERVAL },
      }),
  })
)

export const clinicService = new ClinicService(
  new NotionClient({
    auth: NOTION_AUTH,
  })
)

const notion = new NotionAPI()

export const queryNotionPage = cache((pageId: string) => notion.getPage(pageId))
