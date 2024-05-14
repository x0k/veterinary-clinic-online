export interface Time {
  hours: number
  minutes: number
}

export function durationInMinutes(
  start: Time,
  end: Time,
): number {
  return (end.hours - start.hours) * 60 + (end.minutes - start.minutes)
}

function pad20(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatTime(time: Time): string {
  return `${pad20(time.hours)}:${pad20(time.minutes)}`
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad20(date.getMonth() + 1)}-${pad20(date.getDate())}`
}

export function toIsoDate(date: string): string {
  const dt = new Date(date)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString()
}
