import { CommonModule } from '@angular/common';
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AmountDetails } from '../amount-details/amount-details';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Preview } from '../preview-invoice-data/preview';
import { DataHandlingService } from '../../services/dataHanling.service';
import { InvoiceDetailsData } from '../../types/invoiceDetailsData';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AmountDetails,
    MatTooltipModule,
    Preview,
  ],
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
  invoiceType: string = '';
  //dependancies
  private formBuilder = inject(FormBuilder);
  private dataService = inject(DataHandlingService);
  ngOnInit() {
    this.createInvoiceForm();
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.getData();
  }

  createInvoiceForm() {
    this.invoiceForm = this.formBuilder.group({
      currency: ['', Validators.required],
      currencyAmount: ['', [Validators.required]],
      cryptoAmount: ['', [Validators.required, Validators.pattern(/^\d{1,6}(\.\d{1,6})?$/)]],
      invoiceNumber: ['', Validators.required],
      invoiceDate: [''],
      dueDate: [''],
      description: ['', Validators.required],
    });
  }

  updateCurrencyAmountValidator() {
    const control = this.invoiceForm.get('currencyAmount');

    const pattern =
      this.selectedCurrency === 'INR' ? /^\d{1,6}(\.\d{1,2})?$/ : /^\d{1,6}(\.\d{1,3})?$/;

    control?.setValidators([Validators.required, Validators.pattern(pattern)]);
    control?.updateValueAndValidity();
  }

  closeOpenedModal(page: string) {
    this.storeData();
    this.closeUi.emit(page);
  }

  openDropdown() {
    this.invoiceForm.get('currency')?.markAsTouched();
  }

  selectCurrency(currency: string) {
    this.selectedCurrency = currency;
    this.invoiceForm.get('currency').setValue(currency);
    this.updateCurrencyAmountValidator();
  }

  get invoiceFormControls() {
    return this.invoiceForm.controls;
  }

  changeFormUI(ui: any) {
    this.detailsForm = ui;
    if (ui == 'Amount') {
      this.cryptoAmount = this.invoiceForm.get('cryptoAmount').value;
      this.currencyAmount = this.invoiceForm.get('currencyAmount').value;
    }
  }

  updateForm() {
    this.closeUi.emit('firstForm');
  }

  storeData() {
    const data: InvoiceDetailsData = {
      baseCurrency: this.selectedCurrency,
      invoiceNumber: this.invoiceForm.get('invoiceNumber')?.value,
      invoiceDate: this.invoiceForm.get('invoiceDate')?.value,
      dueDate: this.invoiceForm.get('dueDate')?.value,
      orderDescription: this.invoiceForm.get('description')?.value,
      currencyAmount: this.invoiceForm.get('currencyAmount')?.value,
      cryptoAmount: this.invoiceForm.get('cryptoAmount')?.value,
    };
    this.dataService.setData('invoiceDetails', data);
  }

  getData() {
    const data = this.dataService.getFormData('invoiceDetails');
    if (data) {
      this.invoiceForm.patchValue(data);
      this.selectedCurrency = data.baseCurrency;
      this.invoiceForm.get('currency').patchValue(data.baseCurrency);
      this.invoiceForm.get('description').patchValue(data.orderDescription);
    }
  }

  changeInvoiceType(type: string) {
    this.invoiceType = type;
    if (this.invoiceType == 'Scheduled') {
      this.invoiceForm.get('invoiceDate').setValidators([Validators.required]);
      this.invoiceForm.get('dueDate').setValidators([Validators.required]);
    } else {
      this.invoiceForm.get('invoiceDate')?.clearValidators();
      this.invoiceForm.get('dueDate')?.clearValidators();
    }
    this.invoiceForm.get('invoiceDate')?.updateValueAndValidity();
    this.invoiceForm.get('dueDate')?.updateValueAndValidity();
  }
}
