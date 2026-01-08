import { CommonModule, formatDate } from '@angular/common';
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  everyData: string[] = ['Week', 'Month', 'Year'];
  dayData: number[] = Array.from({ length: 28 }, (_, i) => i + 1);
  weekData: {
    name: string;
    value: number;
  }[] = [
    {
      name: 'Sunday',
      value: 0,
    },
    {
      name: 'Monday',
      value: 1,
    },
    {
      name: 'Tuesday',
      value: 2,
    },
    {
      name: 'Wednessday',
      value: 3,
    },
    {
      name: 'Thursday',
      value: 4,
    },
    {
      name: 'Friday',
      value: 5,
    },

    {
      name: 'Saturday',
      value: 6,
    },
  ];
  monthData: {
    name: string;
    value: number;
  }[] = [
    {
      name: 'January',
      value: 1,
    },
    {
      name: 'February',
      value: 2,
    },
    {
      name: 'March',
      value: 3,
    },
    {
      name: 'April',
      value: 4,
    },
    {
      name: 'May',
      value: 5,
    },
    {
      name: 'June',
      value: 6,
    },
    {
      name: 'July',
      value: 7,
    },
    {
      name: 'August',
      value: 8,
    },
    {
      name: 'September',
      value: 9,
    },
    {
      name: 'October',
      value: 10,
    },
    {
      name: 'November',
      value: 11,
    },
    {
      name: 'December',
      value: 12,
    },
  ];
  selectedCurrency: string;
  currencies: string[] = ['AED', 'INR'];
  detailsForm: string = 'Invoice';
  allFormData: any;
  currencyAmount: number;
  cryptoAmount: number;
  today: string;
  invoiceType: string = '';
  recurrentTextVisible: boolean = false;
  scheduledInvoiceMessage: string;
  recurrentInvoiceMessage: string;

  //dependancies
  private formBuilder = inject(FormBuilder);
  private dataService = inject(DataHandlingService);
  ngOnInit() {
    this.createInvoiceForm();
    this.createRecurrentInvoiceForm();
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
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      every: [null],
      day: [null],
      week: [null],
      month: [null],
    });
  }

  createRecurrentInvoiceForm() {
    this.invoiceForm.get('every')?.valueChanges.subscribe((every) => {
      this.invoiceForm.patchValue(
        {
          day: null,
          week: null,
          month: null,
          year: null,
        },
        { emitEvent: false }
      );

      this.recurrentInvoiceValidator(every);
    });
  }

  recurrentInvoiceValidator(every: string) {
    const day = this.invoiceForm.get('day');
    const week = this.invoiceForm.get('week');
    const month = this.invoiceForm.get('month');

    // CLEAN RESET (only validators + state)
    const resetState = (control: AbstractControl | null) => {
      control?.clearValidators();
      control?.markAsPristine();
      control?.markAsUntouched();
    };
    resetState(day);
    resetState(week);
    resetState(month);

    switch (every) {
      case 'Week':
        week?.setValidators([Validators.required]);
        week?.setValidators([this.requiredAllowZero]);
        break;

      case 'Month':
        day?.setValidators([Validators.required]);
        break;

      case 'Year':
        month?.setValidators([Validators.required]);
        day?.setValidators([Validators.required]);
        break;
    }

    day?.updateValueAndValidity({ emitEvent: false });
    week?.updateValueAndValidity({ emitEvent: false });
    month?.updateValueAndValidity({ emitEvent: false });
  }

  monthChanges() {
    const month = this.invoiceForm.get('month')?.value;

    const daysInMonth = {
      1: 31,
      2: 28,
      3: 31,
      4: 30,
      5: 31,
      6: 30,
      7: 31,
      8: 31,
      9: 30,
      10: 31,
      11: 30,
      12: 31,
    };
    const numberOfDays = daysInMonth[month] || 31;
    this.dayData = Array.from({ length: numberOfDays }, (_, i) => i + 1);
  }

  requiredAllowZero(control: AbstractControl) {
    const value = control.value;

    if (value === null || value === undefined) {
      return { required: true };
    }

    if (typeof value === 'string' && value.trim() === '') {
      return { required: true };
    }

    return null;
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
      invoiceMessage:
        this.invoiceType == 'Scheduled'
          ? this.scheduledInvoiceMessage
          : this.recurrentInvoiceMessage,
      invoiceType: this.invoiceType,
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

  getRecurrentInvoiceText(): string | null {
    const f = this.invoiceForm.value;

    const daySuffix = (n: number) => {
      const j = n % 10,
        k = n % 100;
      if (j === 1 && k !== 11) return `${n}st`;
      if (j === 2 && k !== 12) return `${n}nd`;
      if (j === 3 && k !== 13) return `${n}rd`;
      return `${n}th`;
    };

    const weekName = this.weekData.find((w) => w.value === Number(f.week))?.name ?? '';

    const monthName = this.monthData.find((m) => m.value === Number(f.month))?.name ?? '';

    let msg: string | null = null;

    switch (f.every) {
      case 'Week':
        if (this.invoiceForm.get('week')?.dirty) {
          msg = `You have set recurrent payout for every week on ${weekName}.`;
        }
        break;

      case 'Month':
        if (this.invoiceForm.get('day')?.dirty) {
          msg = `You have set recurrent payout for every month on the ${daySuffix(+f.day)}.`;
        }
        break;

      case 'Year':
        if (this.invoiceForm.get('month')?.dirty && this.invoiceForm.get('day')?.dirty) {
          msg = `You have set recurrent payout for every year on ${monthName} ${daySuffix(
            +f.day
          )}.`;
        }
        break;
    }

    this.recurrentInvoiceMessage = msg;
    return msg;
  }

  getScheduledInvoiceMessage(): string {
    const formattedDate = formatDate(this.invoiceForm.value.dueDate, 'dd MMM yyyy', 'en-US');
    this.scheduledInvoiceMessage = `Your invoice has been scheduled on ${formattedDate}`;
    return this.scheduledInvoiceMessage;
  }

  private clearControls(controlNames: string[]) {
    controlNames.forEach((name) => {
      const control = this.invoiceForm.get(name);
      control?.reset(); // clears value + pristine + untouched
      control?.clearValidators();
      control?.clearAsyncValidators();
      control?.updateValueAndValidity();
    });
  }

  changeInvoiceType(type: string) {
    this.invoiceType = type;

    // Always reset first
    this.clearControls(['invoiceDate', 'dueDate', 'day', 'week', 'month', 'every']);

    if (type === 'Scheduled') {
      this.invoiceForm.get('invoiceDate')?.setValidators(Validators.required);
      this.invoiceForm.get('dueDate')?.setValidators(Validators.required);
    } else if (type === 'Recurrent') {
      this.invoiceForm.get('day')?.setValidators(Validators.required);
    }

    // Update validity once after adding validators
    ['invoiceDate', 'dueDate', 'day'].forEach((name) => {
      this.invoiceForm.get(name)?.updateValueAndValidity();
    });
  }
}
