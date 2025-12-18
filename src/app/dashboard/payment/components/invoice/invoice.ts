import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IConfig, NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, switchMap } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { ContactResponse, ContactType } from '../../models/contactResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';
import { UserData } from '../../../../auth/models/userModel';
import { CreateContactTypePayload } from '../../types/createContactTypePayload';
import { LocalStorageService } from 'angular-web-storage';
import {
  CreateContactPayload,
  QueryPayloadToSearchContact,
} from '../../types/createContactPayload';
import {
  ContactData,
  ContactListData,
  CreateContactResponse,
  GetContactResponse,
} from '../../models/createContactResponse';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceDetails } from '../invoice-details/invoice-details';
import { CreateInvoicePayload } from '../../types/createInvoicePayload';
import { DataHandlingService } from '../../services/dataHanling.service';
import { CryptoCurrency } from '../../types/cryptoCurrency';
import { phoneNumberValidator } from '../../../../validators/phoneNumberValidator';
interface NewContactObject {
  logo: string;
  heading: string;
  para: string;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    NgxCountriesDropdownModule,
    FormsModule,
    MatTooltipModule,
    InvoiceDetails,
  ],
})
export class Invoice {
  @ViewChild('dropdownBtn', { static: false }) dropdownBtn!: ElementRef;
  @ViewChild('closeBtn', { static: false }) closeModal!: ElementRef;

  step: number = 1;
  newContactFormStep: number = 1;
  cryptoCoins: CryptoCurrency[] = [
    { name: 'Tether (USDT)', symbol: 'USDT' },
    { name: 'Bitcoin (BTC)', symbol: 'BTC' },
    { name: 'Ethereum (ETH)', symbol: 'ETH' },
    { name: 'Litecoin (LTC)', symbol: 'LTC' },
    { name: 'Ripple (XRP)', symbol: 'XRP' },
  ];
  networkList: string[] = ['TRC20'];
  contactTypes: ContactType[];
  contacts: any = [];
  cryptoForm: FormGroup;
  addNewContactForm: FormGroup;
  selectedCrypto: string = 'assets/icons/USDT.png';
  qrImage: string = 'assets/icons/qrCode.png';
  isaddingNewContact: string = 'initialUi';
  addNewContactType: boolean = false;
  selectedContact: ContactData;
  selectedCountryCode: string = 'IN';
  newContactStaticUi: NewContactObject[] = [
    {
      logo: 'bi bi-person',
      heading: 'IT LOOKS LIKE YOU DON’T HAVE ANY CONTACTS YET!',
      para: 'Contacts are your beneficiaries for payouts, and once added, their details will appear here.',
    },
    {
      logo: 'bi bi-person-add',
      heading: 'START ADDING YOUR CONTACTS NOW!',
      para: 'Once added, your contacts will be ready to receive payouts. Actual transfers can only be made to contacts set up in live mode.',
    },
    {
      logo: 'bi bi-check-lg',
      heading: 'READY TO GET STARTED?',
      para: 'Set them up and manage your payouts effortlessly.',
    },
  ];

  selectedCountryConfig: IConfig = {
    hideCode: true,
    hideName: false,
    hideDialCode: true,
  };

  selectedPhoneConfig: IConfig = {
    hideCode: true,
    hideName: true,
    hideDialCode: false,
  };

  phoneListConfig: IConfig = {
    hideCode: true,
    hideName: true,
    hideDialCode: false,
  };

  countryListConfig: IConfig = {
    hideCode: true,
    hideName: false,
    hideDialCode: true,
  };
  userData: UserData;
  queryParams: QueryPayloadToSearchContact;
  selectedContactType: string;
  newContactType: string;
  filterContact: FormGroup;
  spinner: boolean = false;
  isUpdatingContact: boolean = false;
  cryptoCurrency: string = '';
  imageFile: File;
  imagePreview: string;
  //dependancy injection
  private formBuilder = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private snackBar = inject(MatSnackBar);
  private platform = inject(PlatformBrowserService);
  private localStorageService = inject(LocalStorageService);
  private dataService = inject(DataHandlingService);

  ngOnInit(): void {
    this.createCryptoForm();
    this.createNewContactForm();
    this.createContactFilterForm();
    if (this.platform.isBrowser) {
      this.userData = this.localStorageService.get('userData');
      this.getAllContactTypes();
      this.filterContacts();
    }
  }

  createCryptoForm() {
    this.cryptoForm = this.formBuilder.group({
      crypto: [''],
      network: [''],
      companyLogo: [''],
    });
  }

  createContactFilterForm() {
    this.filterContact = this.formBuilder.group({
      searchTerm: [''],
    });
  }

  createNewContactForm() {
    this.addNewContactForm = this.formBuilder.group({
      contactName: ['', Validators.required],
      contactType: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', phoneNumberValidator()],
      companyName: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      taxId: [''],
      note: [''],
    });
  }

  uploadFile(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    let file1 = event.target.files;
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
    if (file1.length > 0) {
      let type = file1[0].type;
      let size = Math.round(file1[0].size / 10240);
      if (type != 'image/jpeg' && type != 'image/png') {
        this.snackBar.open('Image should be in .jpeg or .png format.', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      } else {
        if (size > 1024) {
          this.snackBar.open('Size must be less than 10 MB', 'close', {
            duration: 5000,
            panelClass: ['warning-snackbar', 'snackbar-with-progress'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
          });
        }
      }
    }
    event.target.value = '';
  }

  showFilterForm(): boolean {
    if (
      this.cryptoForm.get('crypto').value == '' ||
      this.cryptoForm.get('network').value == '' ||
      this.cryptoForm.get('companyLogo').value == ''
    ) {
      return true;
    } else {
      return false;
    }
  }

  goBack() {
    this.cryptoForm.get('crypto').setValue('');
    this.cryptoForm.get('network').setValue('');
    this.cryptoForm.get('companyLogo').setValue('');
    this.imagePreview = '';
  }

  get cryptoImage(): string {
    const value = this.cryptoForm.get('crypto')?.value;
    return value ? `assets/icons/${value}.png` : 'default.png';
  }

  changeStep(step: number) {
    this.step = step;
    this.cryptoCurrency = this.cryptoForm.get('crypto').value;
  }

  copyAddress(address: string) {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        console.log('copy to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy', err);
      });
  }

  onCountryChange(country: any) {
    this.addNewContactForm.get('country').patchValue(country.name);
    this.selectedCountryCode = country.code;
  }

  //getter function to access all addNewContactForm Controls

  get NewContactFormControls() {
    return this.addNewContactForm.controls;
  }

  changenewContactFormStep() {
    this.isaddingNewContact = 'initialUi';
    this.isUpdatingContact = false;
    this.addNewContactForm.reset();
  }

  createNewContact() {
    if (!this.contacts.length) {
      this.isaddingNewContact = 'addNewContact';
    } else {
      this.isaddingNewContact = 'searchContact';
    }
  }

  closeSearchContact(page: any) {
    console.log(page);
    this.isaddingNewContact = page;
    if (page == 'invoiceDetails') {
      this.storeData();
    }
  }



  createNewContactType(value: boolean) {
    this.addNewContactType = value;
  }

  selectContactType(type: string) {
    this.selectedContactType = type;
    this.addNewContactForm.get('contactType')?.setValue(type);
    this.addNewContactType = false;
    this.filterContacts();
  }

  saveNewContactType() {
    this.selectedContactType = this.newContactType;
    this.NewContactFormControls['contactType']?.setValue(this.selectedContactType);
    this.newContactType = '';

    const payload: CreateContactTypePayload = {
      mode: this.userData.onboardingMode,
      contactType: this.selectedContactType,
    };

    this.paymentService.sendContactType(payload).subscribe({
      next: (res: ContactResponse) => {
        this.contactTypes = res.data.contactTypes;
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
    this.addNewContactType = false;
    this.closeDropdown();
  }
  openDropdown() {
    this.addNewContactForm.get('contactType')?.markAsTouched();
    this.addNewContactType = false;
  }

  closeDropdown() {
    this.dropdownBtn.nativeElement.click();
  }

  filterContacts(): void {
    this.filterContact
      .get('searchTerm')
      .valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.queryParams = {
            mode: this.userData.onboardingMode,
            contactType: this.selectedContactType ? this.selectedContactType : '',
            searchValue,
          };

          return this.paymentService.getAllContacts(this.queryParams);
        })
      )
      .subscribe({
        next: (res: GetContactResponse) => {
          this.contacts = res.data.data;
        },
        error: (err: HttpErrorResponse) => {
          this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
            duration: 5000,
            panelClass: ['error-snackbar', 'snackbar-with-progress'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
          });
        },
      });
  }

  onContactSubmit() {
    this.spinner = true;
    if (this.addNewContactForm.invalid) {
      this.spinner = false;
      this.snackBar.open('Please fill all required details', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
    }
    const {
      contactName,
      contactType,
      email,
      phone,
      taxId,
      note,
      city,
      zipCode,
      state,
      country,
      address,
    } = this.addNewContactForm.value;
    const payload: CreateContactPayload = {
      action: this.isUpdatingContact ? 'UPDATE' : 'CREATE',
      mode: this.userData.onboardingMode,
      contactName,
      contactType,
      note,
      email,
      ...(phone && { phone: phone }),
      ...(taxId && { taxId: taxId }),
      ...(note && { note: note }),
      address: {
        city,
        zip: zipCode,
        state,
        country,
        fullAddress: address,
        countryCode: this.selectedCountryCode,
      },
    };

    this.paymentService.sendContactDetails(payload).subscribe({
      next: (res: CreateContactResponse) => {
        this.spinner = false;
        this.closeModal.nativeElement.click();
        this.snackBar.open(res.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.filterContacts();
      },
      error: (err: HttpErrorResponse) => {
        this.spinner = false;
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.isaddingNewContact = 'viewContact';
  }

  getAllContactTypes() {
    this.paymentService.getAllContactTypes(this.userData.onboardingMode).subscribe({
      next: (res: ContactResponse) => {
        this.contactTypes = res.data.contactTypes;
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  updateContactDetails(contact: ContactListData) {
    this.isUpdatingContact = true;
    this.addNewContactForm.patchValue(contact);
    this.addNewContactForm.get('city').setValue(contact.address.city);
    this.addNewContactForm.get('state').setValue(contact.address.state);
    this.addNewContactForm.get('zipCode').setValue(contact.address.zip);
    this.addNewContactForm.get('country').setValue(contact.address.country);
    this.selectedCountryCode = contact.address.country_code;
    this.addNewContactForm.get('address').setValue(contact.address.full_address);
  }

  getInvoiceFormData(event: Event) {
    const finalData = {
      ...event,
      ...this.selectedContact,
    };
    console.log('the data from all component is...', finalData);
  }

  submitInvoiceData() {
    const Payload: CreateInvoicePayload | any = {
      mode: this.userData.onboardingMode,
      depositCrypto: this.selectedCrypto,
      depositNetwork: 'string',
      depositAddress: 'string',
      contactName: this.selectedContact.contactName,
      contcatType: this.selectedContact.contactType,
      contactEmail: this.selectedContact.email,
      contactPhone: this.selectedContact.phone,
      address: {},
      // invoiceDate: string;
      // dueDate: string;
      // invoiceDescription: string;
      // baseCurrency: string;
      // conversionRate: ConversionRateData;
      // items: Item[];
      // discountPercentage: number;
      // taxPercentage: number;
      // totalAmount: number;
      isDrafted: false,
    };
  }

  storeData() {
    const data = {
      mode: this.userData.onboardingMode,
      depositCrpto: this.selectedCrypto,
      depositNetwork: this.cryptoForm.get('network').value,
      depositAddress: 'network address',
    };
    this.dataService.setData(data);
  }
}
