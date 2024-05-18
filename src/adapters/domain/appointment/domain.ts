import { type Result } from '../result'
import { type DateTimeDTO, type PeriodDTO, type TimeDTO } from '../shared'

import {
  type CreateCustomerDTO,
  type CustomerIdDTO,
  type CustomerIdentityDTO,
} from './customer'
import { type RecordDTO } from './record'
import { type ScheduleEntryDTO } from './schedule'
import { type ServiceIdDTO, type ServiceDTO } from './service'

export type ISODateDTO = string

export type ProductionCalendarDTO = Record<string, number>

export interface SchedulingServiceConfig {
  sampleRateInMinutes: number
}

export interface AppointmentNotionConfig {
  servicesDatabaseId: string
  recordsDatabaseId: string
  breaksDatabaseId: string
  customersDatabaseId: string
}

export interface ProductionCalendarConfig {
  url: string
}

export interface DateTimeLocksRepositoryConfig {
  lock: (dateTimePeriod: PeriodDTO<DateTimeDTO>) => Promise<void>
  unLock: (dateTimePeriod: PeriodDTO<DateTimeDTO>) => Promise<void>
}

export interface AppointmentDomainConfig {
  schedulingService: SchedulingServiceConfig
  notion: AppointmentNotionConfig
  productionCalendar: ProductionCalendarConfig
  dateTimeLocksRepository: DateTimeLocksRepositoryConfig
}

export interface AppointmentScheduleDTO {
  date: string
  entries: ScheduleEntryDTO[]
  nextDate: string
  prevDate: string
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
  upsertCustomer: (
    createCustomer: CreateCustomerDTO
  ) => Promise<Result<CustomerIdDTO>>
  freeTimeSlots: (
    serviceId: ServiceIdDTO,
    appointmentDate: ISODateDTO
  ) => Promise<Result<Array<PeriodDTO<TimeDTO>>>>
  activeAppointment: (
    customerIdentity: CustomerIdentityDTO
  ) => Promise<Result<AppointmentDTO | null>>
  createAppointment: (
    appointmentDate: ISODateDTO,
    customerIdentity: CustomerIdentityDTO,
    serviceId: ServiceIdDTO
  ) => Promise<Result<AppointmentDTO>>
  cancelAppointment: (
    customerIdentity: CustomerIdentityDTO
  ) => Promise<Result<true>>
  services: () => Promise<Result<ServiceDTO[]>>
}
