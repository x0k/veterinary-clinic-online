import axios from 'axios'

export interface PersonFieldMetadata {
  primary?: boolean
  sourcePrimary?: boolean
  verified?: boolean
}

export interface PersonEmailAddress {
  metadata: PersonFieldMetadata
  value: string
  type: string
  formattedType: string
  displayName: string
}

export interface PersonPhoneNumber {
  metadata: PersonFieldMetadata
  value: string
  canonicalForm: string
  type: string
  formattedType: string
}

export interface PersonName {
  metadata: PersonFieldMetadata
  displayName: string
  displayNameLastFirst: string
  unstructuredName: string
  familyName: string
  givenName: string
  middleName: string
  honorificPrefix: string
  honorificSuffix: string
  phoneticFullName: string
  phoneticFamilyName: string
  phoneticGivenName: string
  phoneticMiddleName: string
  phoneticHonorificPrefix: string
  phoneticHonorificSuffix: string
}

export interface GooglePerson {
  resourceName: string
  etag: string
  names: PersonName[]
  emailAddresses: PersonEmailAddress[]
  phoneNumbers?: PersonPhoneNumber[]
}

export const GOOGLE_PEOPLE_API_ROOT = 'https://people.googleapis.com/v1'

const fields = encodeURIComponent(`names,emailAddresses,phoneNumbers`)

export async function getPerson(accessToken: string): Promise<GooglePerson> {
  const data = await axios.get<GooglePerson>(
    `${GOOGLE_PEOPLE_API_ROOT}/people/me?personFields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return data.data
}
