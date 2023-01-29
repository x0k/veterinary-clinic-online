import { Client as NotionClient } from '@notionhq/client'

import {
  ClinicRecord,
  ClinicRecordCreate,
  ClinicServiceEntity,
  IClinicService,
} from '@/models/clinic'
import {
  ClinicRecordProperties,
  ClinicRecordProperty,
  ClinicServiceEntityProperties,
  ClinicServiceEntityProperty,
  getRichTextValue,
  NOTION_RECORDS_PAGE_ID,
  NOTION_SERVICES_PAGE_ID,
  Results,
} from '@/models/notion'
import { UserId } from '@/models/user'
import { dateToDateTimeData } from '@/models/schedule'

export class ClinicService implements IClinicService {
  constructor(private readonly notionClient: NotionClient) {}

  async fetchServices(): Promise<ClinicServiceEntity[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: NOTION_SERVICES_PAGE_ID,
    })
    return (results as Results<ClinicServiceEntityProperties>).map((r) => ({
      id: r.id,
      title: getRichTextValue(
        r.properties[ClinicServiceEntityProperty.Title].title
      ),
      durationInMinutes:
        r.properties[ClinicServiceEntityProperty.Duration].number ?? 0,
    }))
  }

  async fetchRecords(userId?: UserId): Promise<ClinicRecord[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: NOTION_RECORDS_PAGE_ID,
    })
    return (results as Results<ClinicRecordProperties>).map((r) => ({
      id: r.id,
      userId:
        userId &&
        (getRichTextValue(
          r.properties[ClinicRecordProperty.UserId].rich_text
        ) === userId
          ? userId
          : undefined),
      dateTimePeriod: {
        start: dateToDateTimeData(
          new Date(
            r.properties[ClinicRecordProperty.DateTimePeriod].date?.start ?? ''
          )
        ),
        end: dateToDateTimeData(
          new Date(
            r.properties[ClinicRecordProperty.DateTimePeriod].date?.end ?? ''
          )
        ),
      },
    }))
  }

  async createRecord(create: ClinicRecordCreate): Promise<ClinicRecord> {
    throw new Error('Not implemented')
  }

  async removeRecord(id: string): Promise<void> {}
}
