import { type DateTimeDTO, type PeriodDTO } from '../shared'

export enum RecordStatusDTO {
  Awaits = 'awaits',
  Done = 'done',
  NotAppear = 'failed',
}

export interface RecordDTO {
  id: RecordIdDTO
  title: string
  status: RecordStatusDTO
  isArchived: boolean
  dateTimePeriod: PeriodDTO<DateTimeDTO>
  customerId: string
  serviceId: string
  createdAt: string
}

export type RecordIdDTO = string
