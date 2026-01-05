import { Item } from "./createInvoicePayload";

export interface AmmountDetailsData {
  items: Item[];
  discountPercentage: number;
  taxPerentage: number;
  totalAmount: number;
  discountPrice: number;
  taxesPrice: number;
  totalItemsValue: number;
}