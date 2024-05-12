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

export interface RecordsRepositoryConfig {
  createRecord: (record: RecordDTO) => Promise<RecordIdDTO>
  loadBusyPeriods: (date: ISODateDTO) => Promise<Array<PeriodDTO<TimeDTO>>>
  loadCustomerActiveAppointment: (
    customerId: CustomerIdDTO
  ) => Promise<RecordDTO | null>
  removeRecord: (recordId: RecordIdDTO) => Promise<void>
}

export type ProductionCalendarDTO = Record<string, number>

export interface ProductionCalendarRepositoryConfig {
  loadProductionCalendar: () => Promise<ProductionCalendarDTO>
}

export interface WorkBreakDTO {
  id: string
  title: string
  matchExpression: string
  period: PeriodDTO<TimeDTO>
}

export interface WorkBreaksRepositoryConfig {
  loadWorkBreaks: () => Promise<WorkBreakDTO[]>
}

export interface CustomerDTO {
  id: string
  identity: string
  name: string
  phone: string
  email: string
}

export type CustomerIdentityDTO = string

export interface CustomerRepositoryConfig {
  createCustomer: (customer: CustomerDTO) => Promise<CustomerIdDTO>
  loadCustomerByIdentity: (
    customerIdentity: CustomerIdentityDTO
  ) => Promise<CustomerDTO | null>
  updateCustomer: (customer: CustomerDTO) => Promise<void>
}

export interface AppointmentDomainConfig {
  schedulingService: SchedulingServiceConfig
  recordsRepository: RecordsRepositoryConfig
  productionCalendarRepository: ProductionCalendarRepositoryConfig
  workBreaksRepository: WorkBreaksRepositoryConfig
  customerRepository: CustomerRepositoryConfig
}
