enum ScheduleEntryType {
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
  entries: unknown[]
  nextDate: string
  prevDate: string
}

export interface AppointmentDomain {
  schedule: (preferredDate: ISODateDTO) => Promise<AppointmentScheduleDTO>
}

export interface RootDomain {
  appointment: AppointmentDomain
}

enum LogLevel {
  Disabled = -8,
  Debug = -4,
  Info = 0,
  Warn = 4,
  Error = 8,
}

export interface LoggerConfig {
  level: LogLevel
}

export interface AppointmentSchedulingServiceConfig {
  sampleRateInMinutes: number
}

export interface TimeDTO {
  minutes: number
  hours: number
}

export interface DateDTO {
  day: number
  month: number
  year: number
}

export interface DateTimeDTO {
  date: DateDTO
  time: TimeDTO
}

export interface PeriodDTO<T> {
  start: T
  end: T
}

export interface RecordDTO {
  id: string
  title: string
  status: string
  isArchived: boolean
  dateTimePeriod: PeriodDTO<DateTimeDTO>
}

export type RecordIdDTO = string

export type ISODateDTO = string

export type CustomerIdDTO = string

export interface AppointmentRecordsRepositoryConfig {
  createRecord: (record: RecordDTO) => Promise<RecordIdDTO>
  loadBusyPeriods: (date: ISODateDTO) => Promise<Array<PeriodDTO<TimeDTO>>>
  loadCustomerActiveAppointment: (customerId: CustomerIdDTO) => Promise<RecordDTO>
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

export interface AppointmentWorkBreaksConfig {
  loadWorkBreaks: () => Promise<WorkBreakDTO[]>
}

export interface AppointmentConfig {
  schedulingService: AppointmentSchedulingServiceConfig
  recordsRepository: AppointmentRecordsRepositoryConfig
  productionCalendarRepository: AppointmentProductionCalendarRepositoryConfig
  workBreaksRepository: AppointmentWorkBreaksConfig
}

export interface AppConfig {
  logger: LoggerConfig
  appointment: AppointmentConfig
}

declare global {
    export interface Window {
        __init_wasm: (cfg: AppConfig) => RootDomain | Promise<never>
    }
}
