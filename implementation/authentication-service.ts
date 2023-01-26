import { makeStorageAccessor, StorageAccessor } from '@/lib/storage'

import {
  AbstractAuthenticationData,
  AuthenticationData,
  AuthenticationType,
  IAuthenticationService,
  SuccessAuthenticationResponses,
} from '@/models/auth'

const AUTHENTICATION_DATA_FACTORIES: {
  [T in AuthenticationType]: (
    data: SuccessAuthenticationResponses[T]
  ) => Extract<AuthenticationData, AbstractAuthenticationData<T>>
} = {
  [AuthenticationType.Google]: (data) => ({
    t: AuthenticationType.Google,
    at: data.access_token,
    ei: Number(data.expires_in),
  }),
  [AuthenticationType.VK]: (data) => ({
    t: AuthenticationType.VK,
    at: data.access_token,
    ei: Number(data.expires_in),
    em: data.email,
    id: data.user_id,
  }),
}

export class AuthenticationService implements IAuthenticationService {
  private readonly accessor: StorageAccessor<AuthenticationData | null>

  constructor(storage: Storage, key: string) {
    this.accessor = makeStorageAccessor<AuthenticationData | null>(
      storage,
      key,
      null
    )
  }

  async saveAuthenticationData<T extends AuthenticationType>(
    data: SuccessAuthenticationResponses[T]
  ): Promise<void> {
    const authData = AUTHENTICATION_DATA_FACTORIES[data.state](data as never)
    this.accessor.save(authData)
  }

  async loadAuthenticationData(): Promise<AuthenticationData | null> {
    return this.accessor.load()
  }

  async clearAuthenticationData(): Promise<void> {
    this.accessor.clear()
  }
}
