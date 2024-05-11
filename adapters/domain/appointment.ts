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

export interface AppointmentDomain {
  schedule: (
    preferredDate: ISODateDTO
  ) => Promise<Result<AppointmentScheduleDTO>>
  dayOrNextWorkingDay: (now: ISODateDTO) => Promise<Result<ISODateDTO>>
}

export interface AppointmentSchedulingServiceConfig {
  sampleRateInMinutes: number
}

export interface RecordDTO {
  id: string
  title: string
  status: string
  isArchived: boolean
  dateTimePeriod: PeriodDTO<DateTimeDTO>
  customerId: string
  serviceId: string
  createdAt: string
}

export type RecordIdDTO = string

export type ISODateDTO = string

export type CustomerIdDTO = string

export interface AppointmentRecordsRepositoryConfig {
  createRecord: (record: RecordDTO) => Promise<RecordIdDTO>
  loadBusyPeriods: (date: ISODateDTO) => Promise<Array<PeriodDTO<TimeDTO>>>
  loadCustomerActiveAppointment: (
    customerId: CustomerIdDTO
  ) => Promise<RecordDTO | null>
  removeRecord: (recordId: RecordIdDTO) => Promise<void>
}

export type ProductionCalendarDTO = Record<string, number>

export interface AppointmentProductionCalendarRepositoryConfig {
  loadProductionCalendar: () => Promise<ProductionCalendarDTO>
}

export interface WorkBreakDTO {
  id: string
  title: string
  matchExpression: string
  period: PeriodDTO<TimeDTO>
}

export interface AppointmentWorkBreaksRepositoryConfig {
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

export interface AppointmentCustomerRepositoryConfig {
  createCustomer: (customer: CustomerDTO) => Promise<CustomerIdDTO>
  loadCustomerByIdentity: (
    customerIdentity: CustomerIdentityDTO
  ) => Promise<CustomerDTO | null>
  updateCustomer: (customer: CustomerDTO) => Promise<void>
}

export interface AppointmentConfig {
  schedulingService: AppointmentSchedulingServiceConfig
  recordsRepository: AppointmentRecordsRepositoryConfig
  productionCalendarRepository: AppointmentProductionCalendarRepositoryConfig
  workBreaksRepository: AppointmentWorkBreaksRepositoryConfig
  customerRepository: AppointmentCustomerRepositoryConfig
}
