import { Brand } from '@/lib/type'

import { UserId } from './user'
import { DateTimePeriod } from './date'

export type ClinicServiceEntityID = Brand<'clinicServiceEntityId'>

export interface ClinicServiceEntity {
  id: ClinicServiceEntityID
  title: string
  durationInMinutes: number
}

export type ClinicRecordID = Brand<'clinicRecordId'>

export enum ClinicRecordStatus {
  Awaits = 'awaits',
  InWork = 'inWork'
}

export interface ClinicRecord {
  id: ClinicRecordID
  // present only for user record
  userId?: UserId
  status: ClinicRecordStatus
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
  isRecordsLoading: boolean
  clinicRecords: ClinicRecord[]
  createRecord: (data: ClinicRecordCreate) => Promise<void>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
}

export interface IClinicService {
  fetchServices: () => Promise<ClinicServiceEntity[]>
  fetchActualRecords: (userId?: UserId) => Promise<ClinicRecord[]>
  createRecord: (create: ClinicRecordCreate) => Promise<ClinicRecord>
  removeRecord: (id: ClinicRecordID) => Promise<void>
}

export interface ClinicRPCConfig {
  fetchActualRecords: () => Promise<ClinicRecord[]>
  createRecord: (data: ClinicRecordCreate) => Promise<ClinicRecord>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
}
