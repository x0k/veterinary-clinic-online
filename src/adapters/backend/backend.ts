import { z } from 'zod'

export const isoDateSchema = z.string()

function periodSchema<S extends z.ZodType<any>>(
  itemSchema: S
): z.ZodObject<{
  start: S
  end: S
}> {
  return z.object({
    start: itemSchema,
    end: itemSchema,
  })
}

const timeSchema = z.object({
  minutes: z.number(),
  hours: z.number(),
})

const dateSchema = z.object({
  day: z.number(),
  month: z.number(),
  year: z.number(),
})

const dateTimeSchema = z.object({
  date: dateSchema,
  time: timeSchema,
})

export const recordSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  isArchived: z.boolean(),
  dateTimePeriod: periodSchema(dateTimeSchema),
  customerId: z.string(),
  serviceId: z.string(),
  createdAt: z.string(),
})
