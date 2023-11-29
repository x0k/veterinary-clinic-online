import { type DateProperty, type EmailProperty, type NumberProperty, type PhoneNumberProperty, type RelationProperty, type RichTextItemResponse, type RichTextProperty, type RichTextTextItem, type SelectProperty, type TitleProperty } from './vendor'

const {
  NOTION_CLIENT_SECRET,
  NOTION_INFO_PAGE_ID: notionInfoPageId,
  NOTION_SERVICES_PAGE_ID: notionServicesPageId,
  NOTION_RECORDS_PAGE_ID: notionRecordsPageId,
  NOTION_PRIVACY_POLICY_PAGE_ID: notionPrivacyPolicyPageId,
} = process.env

export const NOTION_AUTH = NOTION_CLIENT_SECRET as string
export const NOTION_INFO_PAGE_ID = notionInfoPageId as string
export const NOTION_SERVICES_PAGE_ID = notionServicesPageId as string
export const NOTION_RECORDS_PAGE_ID = notionRecordsPageId as string
export const NOTION_PRIVACY_POLICY_PAGE_ID = notionPrivacyPolicyPageId as string

export function isRichTextTextItem(item: RichTextItemResponse): item is RichTextTextItem {
  return item.type === 'text'
}

export function getRichTextValue(richText: RichTextItemResponse[]): string {
  return richText.filter(isRichTextTextItem).map(t => t.text.content).join('')
}

export enum ClinicServiceEntityProperty {
  Title = 'Наименование',
  Duration = 'Продолжительность в минутах',
  Description = 'Описание',
  Cost = 'Стоимость'
}

export interface ClinicServiceEntityProperties {
  [ClinicServiceEntityProperty.Title]: TitleProperty
  [ClinicServiceEntityProperty.Duration]: NumberProperty
  [ClinicServiceEntityProperty.Description]: RichTextProperty
  [ClinicServiceEntityProperty.Cost]: RichTextProperty
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