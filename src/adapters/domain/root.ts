import {
  type AppointmentDomainConfig,
  type AppointmentDomain,
} from './appointment'
import { type LoggerConfig } from './logger'
import { type Result } from './result'
import { type SharedDomain } from './shared'

export interface RootNotionConfig {
  token: string
}

export interface AppConfig {
  logger: LoggerConfig
  notion: RootNotionConfig
  appointment: AppointmentDomainConfig
}

export interface RootDomain {
  shared: SharedDomain
  appointment: AppointmentDomain
}

declare global {
  function initRootDomain(cfg: AppConfig): Result<RootDomain>
}
