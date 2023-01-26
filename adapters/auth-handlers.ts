import { IAuthenticationService } from '@/models/auth'
import { AuthHandlers } from '@/domains/auth'

export function makeAuthHandlers(
  authService: IAuthenticationService
): AuthHandlers {
  return {
    saveAuthenticationData: authService.saveAuthenticationData.bind(authService),
    clearAuthenticationData:
      authService.clearAuthenticationData.bind(authService),
    loadAuthenticationData:
      authService.loadAuthenticationData.bind(authService),
  }
}
