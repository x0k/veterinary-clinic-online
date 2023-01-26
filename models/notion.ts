const { NOTION_CLIENT_SECRET, NOTION_INFO_PAGE_ID: notionInfoPageId, NOTION_SERVICES_PAGE_ID: notionServicesPageId } =
  process.env

export const NOTION_AUTH = NOTION_CLIENT_SECRET as string

export const NOTION_INFO_PAGE_ID = notionInfoPageId as string

export const NOTION_SERVICES_PAGE_ID = notionServicesPageId as string
