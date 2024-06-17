export type CustomerIdentityDTO = string

export interface CreateCustomerDTO {
  identity: CustomerIdentityDTO
  name: string
  phone: string
  email: string
}

export type CustomerIdDTO = string

export interface CustomerDTO {
  id: CustomerIdDTO
  identity: CustomerIdentityDTO
  name: string
  phone: string
  email: string
}
