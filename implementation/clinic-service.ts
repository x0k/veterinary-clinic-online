import { Client as NotionClient } from '@notionhq/client'

import { isSomething } from '@/lib/guards'
import {
  ClinicRecord,
  ClinicRecordCreate,
  ClinicRecordID,
  ClinicServiceEntity,
  ClinicServiceEntityID,
  IClinicService,
  ClinicRecordStatus as InnerRecordStatus,
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
import {
  dateTimeDataToJSON,
  dateToDateTimeData,
  makeDateTimeShifter,
} from '@/models/date'

const shiftToMoscowTZ = makeDateTimeShifter({
  hours: 3,
})

const serverOffset = (() => {
  const serverDate = new Date()
  return serverDate.getTimezoneOffset() + 180
})()

function moscowDate(dateString: string): Date {
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() + serverOffset)
  return date
}

export class ClinicService implements IClinicService {
  private createClinicRecord(
    page: NotionFullQueryResult<ClinicRecordProperties>,
    userId?: UserId
  ): ClinicRecord | null {
    const startDateTimePeriod =
      page.properties[ClinicRecordProperty.DateTimePeriod].date?.start
    const endDateTimePeriod =
      page.properties[ClinicRecordProperty.DateTimePeriod].date?.end
    if (!startDateTimePeriod || !endDateTimePeriod) {
      return null
    }
    return {
      id: page.id as ClinicRecordID,
      userId:
        userId &&
        (getRichTextValue(
          page.properties[ClinicRecordProperty.UserId].rich_text
        ) === userId
          ? userId
          : undefined),
      status:
        page.properties[ClinicRecordProperty.State].select?.name ===
        ClinicRecordStatus.InWork
          ? InnerRecordStatus.InWork
          : InnerRecordStatus.Awaits,
      dateTimePeriod: {
        start: dateToDateTimeData(moscowDate(startDateTimePeriod)),
        end: dateToDateTimeData(moscowDate(endDateTimePeriod)),
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
        and: [
          {
            property: ClinicRecordProperty.DateTimePeriod,
            date: {
              is_not_empty: true,
            },
          },
          {
            or: [
              {
                property: ClinicRecordProperty.State,
                select: {
                  equals: ClinicRecordStatus.Awaits,
                },
              },
              {
                property: ClinicRecordProperty.State,
                select: {
                  equals: ClinicRecordStatus.InWork,
                },
              },
            ],
          },
        ],
      },
      sorts: [
        {
          property: ClinicRecordProperty.DateTimePeriod,
          direction: 'ascending',
        },
      ],
    })
    return (results as Results<ClinicRecordProperties>)
      .map((result) => this.createClinicRecord(result, userId))
      .filter(isSomething)
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
            start: dateTimeDataToJSON(shiftToMoscowTZ(utcDateTimePeriod.start)),
            end: dateTimeDataToJSON(shiftToMoscowTZ(utcDateTimePeriod.end)),
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
    ) as ClinicRecord
  }

  async removeRecord(id: string): Promise<void> {
    await this.notionClient.pages.update({ page_id: id, archived: true })
  }
}
