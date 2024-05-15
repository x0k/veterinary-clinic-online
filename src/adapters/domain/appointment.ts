import { type Result } from './result'
import { type PeriodDTO, type DateTimeDTO, type TimeDTO } from './shared'

export enum ScheduleEntryType {
  Free = 0,
  Busy = 1,
}

export interface ScheduleEntryDTO {
  type: ScheduleEntryType
  title: string
  dateTimePeriod: PeriodDTO<DateTimeDTO>
}

export interface AppointmentScheduleDTO {
  date: string
  entries: ScheduleEntryDTO[]
  nextDate: string
  prevDate: string
}

export type ServiceIdDTO = string

export interface ServiceDTO {
  id: string
  title: string
  durationInMinutes: number
  description: string
  costDescription: string
}

export interface AppointmentDTO {
  record: RecordDTO
  service: ServiceDTO
}

export interface AppointmentDomain {
  schedule: (
    preferredDate: ISODateDTO
  ) => Promise<Result<AppointmentScheduleDTO>>
  dayOrNextWorkingDay: (now: ISODateDTO) => Promise<Result<ISODateDTO>>
  createAppointment: (
    now: ISODateDTO,
    appointmentDate: ISODateDTO,
    customerId: CustomerIdDTO,
    serviceId: ServiceIdDTO
  ) => Promise<Result<AppointmentDTO>>
}

export interface SchedulingServiceConfig {
  sampleRateInMinutes: number
}

export enum RecordDTOStatus {
  Awaits = 'awaits',
  Done = 'done',
  NotAppear = 'failed',
}

export interface RecordDTO {
  id: RecordIdDTO
  title: string
  status: RecordDTOStatus
  isArchived: boolean
  dateTimePeriod: PeriodDTO<DateTimeDTO>
  customerId: string
  serviceId: string
  createdAt: string
}

export type RecordIdDTO = string

export type ISODateDTO = string

export type CustomerIdDTO = string

export type ProductionCalendarDTO = Record<string, number>

export interface WorkBreakDTO {
  id: string
  title: string
  matchExpression: string
  period: PeriodDTO<TimeDTO>
}

export interface CustomerDTO {
  id: string
  identity: string
  name: string
  phone: string
  email: string
}

export type CustomerIdentityDTO = string

export interface AppointmentNotionConfig {
	servicesDatabaseId: string
	recordsDatabaseId: string
	breaksDatabaseId: string
	customersDatabaseId: string
}

export interface ProductionCalendarConfig {
  url: string
}

export interface AppointmentDomainConfig {
  schedulingService: SchedulingServiceConfig
  notion: AppointmentNotionConfig
  productionCalendar: ProductionCalendarConfig
}
