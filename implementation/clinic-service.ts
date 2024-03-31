import { type Client as NotionClient } from '@notionhq/client'

import { isSomething } from '@/lib/guards'
import {
  type ClinicRecord,
  type ClinicRecordCreate,
  type ClinicRecordID,
  type ClinicServiceEntity,
  type ClinicServiceEntityID,
  type IClinicService,
  ClinicRecordStatus as InnerRecordStatus,
} from '@/models/clinic'
import {
  type ClinicRecordProperties,
  ClinicRecordProperty,
  ClinicRecordStatus,
  type ClinicServiceEntityProperties,
  ClinicServiceEntityProperty,
  getRichTextValue,
  type NotionFullQueryResult,
  type Results,
  type DateProperty,
  type ClinicBreakProperties,
  ClinicBreakProperty,
} from '@/models/notion'
import { type UserId } from '@/models/user'
import {
  type DateTimePeriod,
  dateTimeDataToJSON,
  dateToDateTimeData,
  makeDateTimeShifter,
  dateDataToJSON,
} from '@/models/date'
import { type WorkBreak, type WorkBreaks } from '@/models/schedule'

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

const statusesMap: Record<ClinicRecordStatus, InnerRecordStatus> = {
  [ClinicRecordStatus.Awaits]: InnerRecordStatus.Awaits,
  [ClinicRecordStatus.Done]: InnerRecordStatus.Done,
  [ClinicRecordStatus.NotAppear]: InnerRecordStatus.NotAppear,
  [ClinicRecordStatus.ArchivedDone]: InnerRecordStatus.ArchivedDone,
  [ClinicRecordStatus.ArchivedNotAppear]: InnerRecordStatus.ArchivedNotAppear,
}

export class ClinicService implements IClinicService {
  private parseDateTimePeriod(
    dateResponse: DateProperty
  ): DateTimePeriod | null {
    const startDateTimePeriod = dateResponse.date?.start
    const endDateTimePeriod = dateResponse.date?.end
    if (!startDateTimePeriod || !endDateTimePeriod) {
      return null
    }
    return {
      start: dateToDateTimeData(moscowDate(startDateTimePeriod)),
      end: dateToDateTimeData(moscowDate(endDateTimePeriod)),
    }
  }

  private buildMatchExpression(dateTimePeriod: DateTimePeriod): string {
    const shift = makeDateTimeShifter({ days: 1 })
    const expr = [`^\\d (`]
    let cursor = dateTimePeriod.start
    while (
      cursor.year < dateTimePeriod.end.year ||
      cursor.month < dateTimePeriod.end.month ||
      cursor.days < dateTimePeriod.end.days
    ) {
      expr.push(dateDataToJSON(cursor))
      expr.push('|')
      cursor = shift(cursor)
    }
    expr.push(dateDataToJSON(cursor))
    expr.push(')')
    return expr.join('')
  }

  private createValidClinicRecord(
    page: NotionFullQueryResult<ClinicRecordProperties>,
    dateTimePeriod: DateTimePeriod,
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
      status:
        statusesMap[
          page.properties[ClinicRecordProperty.State].select
            ?.name as ClinicRecordStatus
        ] || InnerRecordStatus.Awaits,
      dateTimePeriod,
    }
  }

  private createClinicRecord(
    page: NotionFullQueryResult<ClinicRecordProperties>,
    userId?: UserId
  ): ClinicRecord | null {
    const dateTimePeriod = this.parseDateTimePeriod(
      page.properties[ClinicRecordProperty.DateTimePeriod]
    )
    if (!dateTimePeriod) {
      return null
    }
    return this.createValidClinicRecord(page, dateTimePeriod, userId)
  }

  constructor(
    private readonly notionClient: NotionClient,
    private readonly servicesPageId: string,
    private readonly recordsPageId: string,
    private readonly breaksPageId: string
  ) {}

  async fetchServices(): Promise<ClinicServiceEntity[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: this.servicesPageId,
    })
    return (results as Results<ClinicServiceEntityProperties>).map((r) => ({
      id: r.id as ClinicServiceEntityID,
      title: getRichTextValue(
        r.properties[ClinicServiceEntityProperty.Title].title
      ),
      durationInMinutes:
        r.properties[ClinicServiceEntityProperty.Duration].number ?? 0,
      description: getRichTextValue(
        r.properties[ClinicServiceEntityProperty.Description].rich_text
      ),
      costDescription: getRichTextValue(
        r.properties[ClinicServiceEntityProperty.Cost].rich_text
      ),
    }))
  }

  async fetchActualRecords(userId?: UserId): Promise<ClinicRecord[]> {
    const { results } = await this.notionClient.databases.query({
      database_id: this.recordsPageId,
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
                  equals: ClinicRecordStatus.Done,
                },
              },
              {
                property: ClinicRecordProperty.State,
                select: {
                  equals: ClinicRecordStatus.NotAppear,
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
    const moscowPeriod = {
      start: shiftToMoscowTZ(utcDateTimePeriod.start),
      end: shiftToMoscowTZ(utcDateTimePeriod.end),
    }
    const response = await this.notionClient.pages.create({
      parent: {
        database_id: this.recordsPageId,
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
            start: dateTimeDataToJSON(moscowPeriod.start),
            end: dateTimeDataToJSON(moscowPeriod.end),
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
    return this.createValidClinicRecord(
      response as NotionFullQueryResult<ClinicRecordProperties>,
      moscowPeriod,
      identity
    )
  }

  async removeRecord(id: string): Promise<void> {
    await this.notionClient.pages.update({ page_id: id, archived: true })
  }

  async fetchWorkBreaks(): Promise<WorkBreaks> {
    const { results } = await this.notionClient.databases.query({
      database_id: this.breaksPageId,
    })
    return (results as Results<ClinicBreakProperties>)
      .map((result) => {
        const dateTimePeriod = this.parseDateTimePeriod(
          result.properties[ClinicBreakProperty.Period]
        )
        if (!dateTimePeriod) {
          return null
        }
        return {
          id: result.id,
          title: getRichTextValue(
            result.properties[ClinicBreakProperty.Title].title
          ),
          period: dateTimePeriod,
          matchExpression: this.buildMatchExpression(dateTimePeriod),
        } satisfies WorkBreak
      })
      .filter(isSomething)
  }
}
