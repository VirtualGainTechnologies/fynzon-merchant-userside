import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Preview } from '../preview-invoice-data/preview';
import { DataHandlingService } from '../../services/dataHanling.service';

@Component({
  selector: 'app-amount-details',
  standalone: true,
  templateUrl: './amount-details.html',
  styleUrls: ['./amount-details.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatTooltipModule, Preview],
})
export class AmountDetails {
  @Input() selectedCrypto: string;
  @Input() selectedCurrency: string;
  @Input() currencyAmount: number;
  @Input() cryptoAmount: number;
  amountDetailsForm: FormGroup;
  finalAmount: number;
  isPreview: boolean = false;
  totalItemsValue: number;
  discountPrice: number;
  taxesPrice: number;

  //dependancies
  private formBuilder = inject(FormBuilder);
  private dataService= inject(DataHandlingService)

  ngOnInit(): void {
    this.createAmountDetailsForm();
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
      itemName: ['', Validators.required],
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
    }
  }

  get items(): FormArray {
    return this.amountDetailsForm.get('items') as FormArray;
  }

  totalAmount() {
    this.totalItemsValue = this.items.controls.reduce((total, control) => {
      let { quantity, pricePerQuantity } = control.value;

      let qty = Number(quantity) || 0;
      let price = Number(pricePerQuantity) || 0;

      return total + qty * price;
    }, 0);

    let discount = Number(this.amountDetailsForm.get('discount')?.value * 0.01) || 0;
    let taxes = Number(this.amountDetailsForm.get('taxes')?.value * 0.01) || 0;

    this.discountPrice = this.totalItemsValue * discount;
    this.taxesPrice = this.totalItemsValue * taxes;

    this.finalAmount = (this.totalItemsValue - this.discountPrice + this.taxesPrice) * (this.cryptoAmount/this.currencyAmount);
  }

  openPreview() {
    this.isPreview = true;
    const data = {
      items: this.amountDetailsForm.get('items').value,
      discountPercentage: this.amountDetailsForm.get('discount').value,
      taxPerentage: this.amountDetailsForm.get('taxes').value,
      totalAmount:this.finalAmount
    }
    this.dataService.setData(data)
  }
}
