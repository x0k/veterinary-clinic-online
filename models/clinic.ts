import { UserId } from './user'
import { DateTimePeriod } from './schedule'
import { Brand } from '@/lib/type'

export type ClinicServiceEntityID = Brand<'clinicServiceEntityId'>

export interface ClinicServiceEntity {
  id: ClinicServiceEntityID
  title: string
  durationInMinutes: number
}

export type ClinicRecordID = Brand<'clinicRecordId'>

export interface ClinicRecord {
  id: ClinicRecordID
  // present only for user record
  userId?: UserId
  dateTimePeriod: DateTimePeriod
}

export interface ClinicRecordCreate {
  identity: UserId
  userName: string
  userEmail: string
  userPhone: string
  service: ClinicServiceEntityID
  utcDateTimePeriod: DateTimePeriod
}

export interface Clinic {
  clinicRecords: ClinicRecord[]
  dismissRecord: (recordId: ClinicRecordID) => void
}

export interface IClinicService {
  fetchServices: () => Promise<ClinicServiceEntity[]>
  fetchActualRecords: (userId?: UserId) => Promise<ClinicRecord[]>
  createRecord: (create: ClinicRecordCreate) => Promise<ClinicRecord>
  removeRecord: (id: ClinicRecordID) => Promise<void>
}

export interface ClinicRPCConfig {
  fetchActualRecords: () => Promise<ClinicRecord[]>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
}
