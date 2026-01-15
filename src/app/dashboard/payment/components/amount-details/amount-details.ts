import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { DataHandlingService } from '../../services/dataHanling.service';
import { AmmountDetailsData } from '../../types/amountDetailsData';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';
import { UserData } from '../../../../auth/models/userModel';
import { LocalStorageService } from 'angular-web-storage';

@Component({
  selector: 'app-amount-details',
  standalone: true,
  templateUrl: './amount-details.html',
  styleUrls: ['./amount-details.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatTooltipModule],
})
export class AmountDetails {
  @Input() selectedCrypto: string;
  @Input() selectedCurrency: string;
  @Input() currencyAmount: number;
  @Input() cryptoAmount: number;
  @Output() changeUitoPreviewPage = new EventEmitter<any>();
  amountDetailsForm: FormGroup;
  finalAmount: number;
  isPreview: boolean = false;
  totalItemsValue: number;
  discountPrice: number;
  taxesPrice: number;
  userData: UserData;
  category: string;

  //dependancies
  private formBuilder = inject(FormBuilder);
  private dataService = inject(DataHandlingService);
  private platform = inject(PlatformBrowserService);
  private localStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.createAmountDetailsForm();
    if (this.platform.isBrowser) {
      this.userData = this.localStorageService.get('userData');
      this.category= this.userData?.businessCategory || this.userData?.profession
    }
    this.getData();
  }

  getData() {
    const data = this.dataService.getFormData('amountDetails');
    if (data) {
      this.syncItemsFormArray(data.items);
      this.items.patchValue(data.items);
      this.amountDetailsForm.get('discount').patchValue(data.discountPercentage);
      this.amountDetailsForm.get('taxes').patchValue(data.taxPerentage);
      this.finalAmount = data.totalAmount;
      this.discountPrice = data.discountPrice;
      this.taxesPrice = data.taxesPrice;
      this.totalItemsValue = data.totalItemsValue;
    }
  }

  ngDoCheck() {
    this.totalAmount();
  }

  createAmountDetailsForm() {
    this.amountDetailsForm = this.formBuilder.group({
      discount: ['', Validators.required],
      taxes: ['', Validators.required],
      items: this.formBuilder.array([this.createItemsForm()]),
    });
  }

  createItemsForm() {
    return this.formBuilder.group({
      id: crypto.randomUUID(),
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      quantity: ['', Validators.required],
      pricePerQuantity: ['', Validators.required],
    });
  }

  addItem() {
    if (this.items.length < 5) {
      (this.amountDetailsForm.get('items') as FormArray).push(this.createItemsForm());
    }
  }

  removeItem(index: number) {
    if (index !== -1) {
      this.items.removeAt(index);
       this.items.updateValueAndValidity();
    }
  }

  get items(): FormArray {
    return this.amountDetailsForm.get('items') as FormArray;
  }

  syncItemsFormArray(itemsData: any[]) {
    while (this.items.length < itemsData.length) {
      this.items.push(this.createItemsForm());
    }

    while (this.items.length > itemsData.length) {
      this.items.removeAt(this.items.length - 1);
    }
  }

  totalAmount() {
    this.totalItemsValue = this.items.controls.reduce((total, control) => {
      let { quantity, pricePerQuantity } = control.value;

      let qty = Number(quantity) || 0;
      let price = Number(pricePerQuantity) || 0;
      if (this.category==='Builder') {
        return total + price;
      } else {
        return total + qty * price;
      }
    }, 0);

    let discount = Number(this.amountDetailsForm.get('discount')?.value * 0.01) || 0;
    let taxes = Number(this.amountDetailsForm.get('taxes')?.value * 0.01) || 0;

    this.discountPrice = this.totalItemsValue * discount;
    this.taxesPrice = this.totalItemsValue * taxes;

    this.finalAmount =
      (this.totalItemsValue - this.discountPrice + this.taxesPrice) *
      (this.cryptoAmount / this.currencyAmount);
  }

  openPreview() {
    this.changeUitoPreviewPage.emit('Preview');
    const data: AmmountDetailsData = {
      items: this.amountDetailsForm.get('items').value,
      discountPercentage: this.amountDetailsForm.get('discount').value,
      taxPerentage: this.amountDetailsForm.get('taxes').value,
      totalAmount: this.finalAmount,
      discountPrice: this.discountPrice,
      taxesPrice: this.taxesPrice,
      totalItemsValue: this.totalItemsValue,
    };
    this.dataService.setData('amountDetails', data);
  }
}
