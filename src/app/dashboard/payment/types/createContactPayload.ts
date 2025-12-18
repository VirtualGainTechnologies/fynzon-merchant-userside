export interface CreateContactPayload {
  action: string;
  mode: string;
  contactName: string;
  contactType: string;
  email: string;
  phone?: string;
  taxId?: string;
  note?: string;
  address: AddressData;
}

export interface AddressData {
  city: string;
  zip: string;
  state: string;
  country: string;
  fullAddress: string;
  countryCode: string;
  full_address?: string;
  country_code?: string;
}

export interface QueryPayloadToSearchContact {
  mode: string;
  contactType: string;
  searchValue: string;
}