import { z } from 'zod'

import { type Brand } from '@/lib/type'
import { fakeGuard } from '@/lib/guards'

import { type UserId } from './user'
import { dateTimePeriodSchema, type DateTimePeriod } from './date'

export type ClinicServiceEntityID = Brand<'clinicServiceEntityId'>

export interface ClinicServiceEntity {
  id: ClinicServiceEntityID
  title: string
  durationInMinutes: number
  description: string
  costDescription: string
}

export type ClinicRecordID = Brand<'clinicRecordId'>

export const clinicRecordIdSchema = z.string().refine(fakeGuard<ClinicRecordID>)

export enum ClinicRecordStatus {
  Awaits = 'awaits',
  Done = 'done',
  NotAppear = 'notAppear',
  ArchivedDone = 'archivedDone',
  ArchivedNotAppear = 'archivedNotAppear',
}

export const CLINIC_RECORD_STATUS_TITLES: Record<ClinicRecordStatus, string> = {
  [ClinicRecordStatus.Awaits]: 'Ожидает',
  [ClinicRecordStatus.Done]: 'Выполнено',
  [ClinicRecordStatus.NotAppear]: 'Не пришел',
  [ClinicRecordStatus.ArchivedDone]: 'Архив (выполнено)',
  [ClinicRecordStatus.ArchivedNotAppear]: 'Архив (не пришел)',
}

export interface ClinicRecord {
  id: ClinicRecordID
  // present only for user record
  userId?: UserId
  status: ClinicRecordStatus
  dateTimePeriod: DateTimePeriod
}

export const clinicRecordCreateSchema = z.object({
  userName: z.string(),
  userEmail: z.string(),
  userPhone: z.string(),
  service: z.string().refine(fakeGuard<ClinicServiceEntityID>),
  utcDateTimePeriod: dateTimePeriodSchema,
})

export interface ClinicRecordCreate {
  userName: string
  userEmail: string
  userPhone: string
  service: ClinicServiceEntityID
  utcDateTimePeriod: DateTimePeriod
}

export interface Clinic {
  isRecordsLoading: boolean
  isRecordsFetching: boolean
  clinicRecords: ClinicRecord[]
  createRecord: (data: ClinicRecordCreate) => Promise<void>
  dismissRecord: (recordId: ClinicRecordID) => Promise<void>
}

export interface IClinicService {
  fetchServices: () => Promise<ClinicServiceEntity[]>
  fetchActualRecords: (userId?: UserId) => Promise<ClinicRecord[]>
  createRecord: (userId: UserId, create: ClinicRecordCreate) => Promise<ClinicRecord>
  removeRecord: (userId: UserId, id: ClinicRecordID) => Promise<void>
}
