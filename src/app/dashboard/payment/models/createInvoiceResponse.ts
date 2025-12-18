import { AddressData } from "../types/createContactPayload";
import { Item } from "../types/createInvoicePayload";

export interface CreateInvoiceResponse {
  message: string;
  error: boolean;
  data: CreateResponseData;
}

export interface CreateResponseData {
  merchant_id: string;
  merchant_email: string;
  mode: string;
  deposit_crypto: string;
  deposit_network: string;
  deposit_address: string;
  conatct_name: string;
  contact_type: string;
  contact_email: string;
  contact_phone: string;
  address: AddressData;
  invoice_number: string;
  invoice_date: number;
  due_date: number;
  invoice_description: string;
  base_currency: string;
  conversion_rate: {
    currency: string;
    crypto: string;
    currency_amount: number;
    crypto_amount: number;
  }
  items: Item[];
  discount_percentage: number;
  tax_percentage: number;
  total_amount: number;
  status: string;
  date: number;
  _id: string;
  createdAt: string;
  updateAt: string;
}