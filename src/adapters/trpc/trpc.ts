import { z } from 'zod'

export const isoDateSchema = z.string()

export const serviceIdSchema = z.string()

export const createAppointmentSchema = z.object({
  appointmentDate: isoDateSchema,
  serviceId: serviceIdSchema,
})

export const createCustomerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
})

export const freeTimeSlotsQuery = z.object({
  serviceId: serviceIdSchema,
  appointmentDate: isoDateSchema,
})
