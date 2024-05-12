import { type AppointmentDomainConfig, type AppointmentDomain } from './appointment'
import { type LoggerConfig } from './logger'
import { type Result } from './result'
import { type SharedDomain } from './shared'

export interface RootDomain {
  shared: SharedDomain
  appointment: AppointmentDomain
}

export interface AppConfig {
  logger: LoggerConfig
  appointment: AppointmentDomainConfig
}

declare global {
  export interface Window {
    __init_wasm: (cfg: AppConfig) => Result<RootDomain>
  }
}
