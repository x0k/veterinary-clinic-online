import { DateProperty, EmailProperty, NumberProperty, PhoneNumberProperty, RelationProperty, RichTextItemResponse, RichTextProperty, SelectProperty, TitleProperty } from './vendor'

const {
  NOTION_CLIENT_SECRET,
  NOTION_INFO_PAGE_ID: notionInfoPageId,
  NOTION_SERVICES_PAGE_ID: notionServicesPageId,
  NOTION_RECORDS_PAGE_ID: notionRecordsPageId,
} = process.env

export const NOTION_AUTH = NOTION_CLIENT_SECRET as string

export const NOTION_INFO_PAGE_ID = notionInfoPageId as string

export const NOTION_SERVICES_PAGE_ID = notionServicesPageId as string

export const NOTION_RECORDS_PAGE_ID = notionRecordsPageId as string

export function getRichTextValue(richText: RichTextItemResponse[]): string {
  return richText.map(t => t.plain_text).join('')
}

export enum ClinicServiceEntityProperty {
  Title = 'Наименование',
  Duration = 'Продолжительность в минутах',
}

export interface ClinicServiceEntityProperties {
  [ClinicServiceEntityProperty.Title]: TitleProperty
  [ClinicServiceEntityProperty.Duration]: NumberProperty
}

export enum ClinicRecordProperty {
  Title = 'ФИО',
  Service = 'Услуга',
  PhoneNumber = 'Телефон',
  Email = 'Почта',
  DateTimePeriod = 'Время записи',
  State = 'Статус',
  UserId = 'identity'
}

export enum ClinicRecordStatus {
  Awaits = 'Ожидает',
  InWork = 'В работе',
  Done = 'Выполнено',
  NotAppear = 'Не пришел'
}

export interface ClinicRecordProperties {
  [ClinicRecordProperty.Title]: TitleProperty,
  [ClinicRecordProperty.Service]: RelationProperty,
  [ClinicRecordProperty.PhoneNumber]: PhoneNumberProperty,
  [ClinicRecordProperty.Email]: EmailProperty,
  [ClinicRecordProperty.DateTimePeriod]: DateProperty,
  [ClinicRecordProperty.State]: SelectProperty,
  [ClinicRecordProperty.UserId]: RichTextProperty
}