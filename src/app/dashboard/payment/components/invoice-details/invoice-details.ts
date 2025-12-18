import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AmountDetails } from '../amount-details/amount-details';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AmountDetails, MatTooltipModule],
})
export class InvoiceDetails {
  @Input() selectedCrypto: string;
  @Input() selectedContact: any;
  @Output() closeUi = new EventEmitter<any>();
  invoiceForm: FormGroup;
  selectedCurrency: string;
  currencies: string[] = ['AED', 'INR'];
  detailsForm: string = 'Invoice';
  allFormData: any;
  currencyAmount: number;
  cryptoAmount: number;
  today: string;
  //dependancies
  private formBuilder = inject(FormBuilder);

  ngOnInit() {
    this.createInvoiceForm();
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }

  createInvoiceForm() {
    this.invoiceForm = this.formBuilder.group({
      currency: ['', Validators.required],
      currencyAmount: ['', Validators.required],
      cryptoAmount: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  closedOpenedModal(page:string) {
    this.closeUi.emit(page);
  }

  openDropdown() {
    this.invoiceForm.get('currency')?.markAsTouched();
  }

  selectCurrency(currency: string) {
    this.selectedCurrency = currency;
    this.invoiceForm.get('currency').setValue(currency);
  }

  get invoiceFormControls() {
    return this.invoiceForm.controls;
  }

  changeFormUI(ui: string) {
    this.detailsForm = ui;

    if (ui == 'Amount') {
      this.cryptoAmount = this.invoiceForm.get('cryptoAmount').value;
      this.currencyAmount = this.invoiceForm.get('currencyAmount').value;
    }
  }
}
