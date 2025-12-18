import { AddressData } from "./createContactPayload";

export interface CreateInvoicePayload {
  mode: string;
  depositCrypto: string;
  depositNetwork: string;
  depositAddress: string;
  contactName: string;
  contcatType: string;
  contactEmail: string;
  contactPhone: string;
  address: AddressData;
  invoiceDate: string;
  dueDate: string;
  invoiceDescription: string;
  baseCurrency: string;
  conversionRate: ConversionRateData;
  items: Item[];
  discountPercentage: number;
  taxPercentage: number;
  totalAmount: number;
  isDrafted: boolean;
}


export interface ConversionRateData {
  currency: string;
  crypto: string;
  currencyAmount: number;
  cryptoamount: number;
}

export interface Item {
  name: string;
  quantity: number;
  price: number;
  priceCurrency?: string;
  price_currency?: string;
}

