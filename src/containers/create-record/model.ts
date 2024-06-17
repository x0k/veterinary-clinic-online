import { type ServiceIdDTO } from '@/adapters/domain'
import { type FormattedDate } from '@/shared/date'

export interface FormFields {
  service: ServiceIdDTO
  recordDate: FormattedDate
  userName: string
  userPhone: string
  recordTime: string
}

export const REQUIRED_FIELD_ERROR_MESSAGE =
  'Это поле обязательно для заполнения'
