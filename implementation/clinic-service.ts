import { Client as NotionClient } from '@notionhq/client'

import {
  ClinicRecord,
  ClinicRecordCreate,
  ClinicRecordID,
  ClinicServiceEntity,
  ClinicServiceEntityID,
  IClinicService,
} from '@/models/clinic'
import {
  ClinicRecordProperties,
  ClinicRecordProperty,
  ClinicRecordStatus,
  ClinicServiceEntityProperties,
  ClinicServiceEntityProperty,
  getRichTextValue,
  NotionFullQueryResult,
  NOTION_RECORDS_PAGE_ID,
  NOTION_SERVICES_PAGE_ID,
  Results,
} from '@/models/notion'
import { UserId } from '@/models/user'
import { dateTimeDataToJSON, dateToDateTimeData } from '@/models/schedule'

export class ClinicService implements IClinicService {
  private createClinicRecord(
    page: NotionFullQueryResult<ClinicRecordProperties>,
    userId?: UserId
  ): ClinicRecord {
    return {
      id: page.id as ClinicRecordID,
      userId:
        userId &&
        (getRichTextValue(
          page.properties[ClinicRecordProperty.UserId].rich_text
        ) === userId
          ? userId
          : undefined),
      dateTimePeriod: {
        start: dateToDateTimeData(
          new Date(
            page.properties[ClinicRecordProperty.DateTimePeriod].date?.start ??
              ''
          )
        ),
        end: dateToDateTimeData(
          new Date(
            page.properties[ClinicRecordProperty.DateTimePeriod].date?.end ?? ''
          )
        ),
      },
    }
  }

  constructor(private readonly notionClient: NotionClient) {}

  async fetchServices(): Promise<ClinicServiceEntity[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: NOTION_SERVICES_PAGE_ID,
    })
    return (results as Results<ClinicServiceEntityProperties>).map((r) => ({
      id: r.id as ClinicServiceEntityID,
      title: getRichTextValue(
        r.properties[ClinicServiceEntityProperty.Title].title
      ),
      durationInMinutes:
        r.properties[ClinicServiceEntityProperty.Duration].number ?? 0,
    }))
  }

  async fetchActualRecords(userId?: UserId): Promise<ClinicRecord[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: NOTION_RECORDS_PAGE_ID,
      filter: {
        property: ClinicRecordProperty.State,
        select: {
          equals: ClinicRecordStatus.Awaits,
        },
      },
    })
    return (results as Results<ClinicRecordProperties>).map((result) =>
      this.createClinicRecord(result, userId)
    )
  }

  async createRecord({
    utcDateTimePeriod,
    identity,
    service,
    userEmail,
    userName,
    userPhone,
  }: ClinicRecordCreate): Promise<ClinicRecord> {
    const response = await this.notionClient.pages.create({
      parent: {
        database_id: NOTION_RECORDS_PAGE_ID,
      },
      properties: {
        [ClinicRecordProperty.Title]: {
          type: 'title',
          title: [{ type: 'text', text: { content: userName } }],
        },
        [ClinicRecordProperty.Service]: {
          type: 'relation',
          relation: [{ id: service }],
        },
        [ClinicRecordProperty.PhoneNumber]: {
          type: 'phone_number',
          phone_number: userPhone,
        },
        [ClinicRecordProperty.Email]: {
          type: 'email',
          email: userEmail,
        },
        [ClinicRecordProperty.DateTimePeriod]: {
          type: 'date',
          date: {
            start: dateTimeDataToJSON(utcDateTimePeriod.start),
            end: dateTimeDataToJSON(utcDateTimePeriod.end),
            time_zone: 'Europe/Moscow',
          },
        },
        [ClinicRecordProperty.State]: {
          type: 'select',
          select: {
            name: ClinicRecordStatus.Awaits,
          },
        },
        [ClinicRecordProperty.UserId]: {
          type: 'rich_text',
          rich_text: [{ type: 'text', text: { content: identity } }],
        },
      },
    })
    return this.createClinicRecord(
      response as NotionFullQueryResult<ClinicRecordProperties>,
      identity
    )
  }

  async removeRecord(id: string): Promise<void> {
    await this.notionClient.pages.update({ page_id: id, archived: true })
  }
}
