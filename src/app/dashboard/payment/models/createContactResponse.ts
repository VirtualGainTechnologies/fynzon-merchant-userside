import { AddressData } from '../types/createContactPayload';

export interface CreateContactResponse {
  message: string;
  error: boolean;
  data: ContactData;
}

export interface ContactData {
  action: string;
  id: string;
  mode: string;
  email: string;
  phone: string;
  contactName: string;
  companyName: string;
  contactType: string;
  taxId: string;
  note: string;
  status: string;
  address: AddressData;
  date: number;
}

export interface GetContactResponse {
  message: string;
  error: boolean;
  data: {
    totalRecords: number;
    data: ContactListData[];
  };
}

export interface ContactListData {
  id: string;
  mode: string;
  email: string;
  phone: string;
  contactName: string;
  contactType: string;
  taxId?: string;
  note?: string;
  status: string;
  address: AddressData;
  date: string;
}
