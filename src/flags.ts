import { unstable_flag as flag } from '@vercel/flags/next'
import { get } from '@vercel/edge-config'

export const allowAppointments = flag({
  key: 'appointments',
  async decide() {
    const value = await get(this.key)
    return value === true
  },
})
