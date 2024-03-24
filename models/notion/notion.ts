import { type DateProperty, type EmailProperty, type NumberProperty, type PhoneNumberProperty, type RelationProperty, type RichTextItemResponse, type RichTextProperty, type RichTextTextItem, type SelectProperty, type TitleProperty } from './vendor'

const {
  NOTION_CLIENT_SECRET,
  NOTION_INFO_PAGE_ID: notionInfoPageId,
  NOTION_SERVICES_PAGE_ID: notionServicesPageId,
  NOTION_RECORDS_PAGE_ID: notionRecordsPageId,
  NOTION_PRIVACY_POLICY_PAGE_ID: notionPrivacyPolicyPageId,
  NOTION_BREAKS_PAGE_ID: notionBreaksPageId
} = process.env

export const NOTION_AUTH = NOTION_CLIENT_SECRET!
export const NOTION_INFO_PAGE_ID = notionInfoPageId!
export const NOTION_SERVICES_PAGE_ID = notionServicesPageId!
export const NOTION_RECORDS_PAGE_ID = notionRecordsPageId!
export const NOTION_BREAKS_PAGE_ID = notionBreaksPageId!
export const NOTION_PRIVACY_POLICY_PAGE_ID = notionPrivacyPolicyPageId!

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
  Done = 'Выполнено',
  NotAppear = 'Не пришел',
  ArchivedDone = 'Архив выполнено',
  ArchivedNotAppear = 'Архив не пришел',
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

export enum ClinicBreakProperty {
  Title = 'Наименование',
  Period = 'Период',
}

export interface ClinicBreakProperties {
  [ClinicBreakProperty.Title]: TitleProperty
  [ClinicBreakProperty.Period]: DateProperty
}
