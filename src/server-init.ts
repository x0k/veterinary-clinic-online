import { NotionAPI } from 'notion-client'
import { cache } from 'react'

const notion = new NotionAPI()

export const queryNotionPage = cache((pageId: string) => notion.getPage(pageId))
