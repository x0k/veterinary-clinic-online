import { UserId } from './user'
import { DateTimePeriod } from './schedule'

export type ClinicServiceEntityID = string

export interface ClinicServiceEntity {
  id: ClinicServiceEntityID
  title: string
  durationInMinutes: number
}

export type ClinicRecordID = string

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
  dateTimePeriod: DateTimePeriod
}

export interface ClinicData {
  clinicRecords: ClinicRecord[]
}

export interface IClinicService {
  fetchServices: () => Promise<ClinicServiceEntity[]>
  fetchRecords: (userId: UserId) => Promise<ClinicRecord[]>
  createRecord: (create: ClinicRecordCreate) => Promise<ClinicRecord>
  removeRecord: (id: ClinicRecordID) => Promise<void>
}

export interface ClinicRPCConfig {
  fetchRecords: () => Promise<ClinicRecord[]>
}
