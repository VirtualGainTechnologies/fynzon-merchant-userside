import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ContactData } from '../models/createContactResponse';
import { PaymentWalletData } from '../types/paymentWalletData';
import { AmmountDetailsData } from '../types/amountDetailsData';
import { InvoiceDetailsData } from '../types/invoiceDetailsData';
export interface invoiceFormData {
  paymentWalletDetails: PaymentWalletData,
  contactDetails: ContactData,
  invoiceDetails: InvoiceDetailsData,
  amountDetails:AmmountDetailsData,
}
@Injectable({
  providedIn: 'root',
})
export class DataHandlingService {
  private data = new BehaviorSubject<invoiceFormData| null>(null);
  public formData: Observable<any> = this.data.asObservable();

  setData(formName: string, formValue: any) {
    const currentData = this.data.getValue();
    this.data.next({ ...currentData, [formName]: formValue });
  }

  getFormData(formName: string): any {
    return this.data.getValue()[formName];
  }
}
