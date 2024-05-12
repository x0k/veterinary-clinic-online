import { type ClinicServiceEntityID } from '@/models/clinic'
import { type JSONDate } from '@/models/date'

export interface FormFields {
  service: ClinicServiceEntityID
  recordDate: JSONDate
  userName: string
  userPhone: string
  recordTime: string
}

export const REQUIRED_FIELD_ERROR_MESSAGE =
  'Это поле обязательно для заполнения'
