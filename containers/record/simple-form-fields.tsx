import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  Box,
} from '@chakra-ui/react'
import { type FieldErrors, type UseFormRegister } from 'react-hook-form'

import { type ClinicServiceEntity } from '@/models/clinic'
import { type JSONDate } from '@/models/date'

import { type FormFields, REQUIRED_FIELD_ERROR_MESSAGE } from './model'

export interface SimpleFormFieldsProps {
  today: JSONDate
  clinicServices: ClinicServiceEntity[]
  errors: FieldErrors<FormFields>
  register: UseFormRegister<FormFields>
}

export function SimpleFormFields({
  today,
  clinicServices,
  register,
  errors,
}: SimpleFormFieldsProps): JSX.Element {
  return (
    <>
      <FormControl isRequired isInvalid={Boolean(errors.userName)}>
        <FormLabel htmlFor="userName">Имя</FormLabel>
        <Input
          id="userName"
          {...register('userName', {
            required: REQUIRED_FIELD_ERROR_MESSAGE,
          })}
        />
        <FormErrorMessage>{errors.userName?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={Boolean(errors.userPhone)}>
        <FormLabel htmlFor="userPhone">Телефон</FormLabel>
        <Input
          id="userPhone"
          type="tel"
          {...register('userPhone', {
            required: REQUIRED_FIELD_ERROR_MESSAGE,
          })}
        />
        <FormErrorMessage>{errors.userPhone?.message}</FormErrorMessage>
      </FormControl>
      <Box display="flex" gap="4">
        <FormControl isRequired isInvalid={Boolean(errors.service)} flexGrow="1">
          <FormLabel htmlFor="service">Услуга</FormLabel>
          <Select
            id="service"
            {...register('service', {
              required: REQUIRED_FIELD_ERROR_MESSAGE,
            })}
          >
            {clinicServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.service?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={Boolean(errors.recordDate)}>
          <FormLabel htmlFor="recordDate">Дата</FormLabel>
          <Input
            id="recordDate"
            type="date"
            min={today}
            {...register('recordDate', {
              required: REQUIRED_FIELD_ERROR_MESSAGE,
              min: {
                value: today,
                message: 'Не записывайтесь на прошедшие даты',
              },
            })}
          />
          <FormErrorMessage>{errors.recordDate?.message}</FormErrorMessage>
        </FormControl>
      </Box>
    </>
  )
}
