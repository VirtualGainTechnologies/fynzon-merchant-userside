import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ngxCsv } from 'ngx-csv';
import { Observable, combineLatest } from 'rxjs';
import { MatRadioModule } from '@angular/material/radio';
import { NgOtpInputModule } from 'ng-otp-input';
import { OtpData } from '../../../../auth/models/otpModel';
import { UserData } from '../../../../auth/models/userModel';
import { AuthService } from '../../../../auth/services/auth.service';
import { ApiSettingModel } from '../../models/apiSettingDataModel';
import { FixedMaskDataPipe } from '../../../../pipes/mask-data.pipe';
import { TruncateTextDirective } from '../../../../directives/text-trucate';
import { getTimer } from '../../../../utils/timer';
import { ApiSettingService } from '../../services/api-seeting.service';
import { secureUrlValidator } from '../../../../validators/secureUrlValidator';
import { ipv4AddressValidator } from '../../../../validators/ipv4AddressValidator';
import { copyText } from '../../../../utils/copyText';
import { DeveloperControlModel, DeveloperData } from '../../models/developerControlModel';
import { AuthData } from '../../../../auth/models/authModel';

@Component({
  selector: 'app-api-setting',
  standalone: true,
  templateUrl: './api-setting.html',
  styleUrls: ['./api-setting.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatTooltipModule,
    NgOtpInputModule,
    FixedMaskDataPipe,
    TruncateTextDirective,
  ],
})
export class ApiSettingComponent {
  generateApiKeyForm: FormGroup;
  addIpAddressForm: FormGroup;
  addWebhookUrlForm: FormGroup;
  step: number = 1;
  loader: boolean = false;
  isKeysSaved: boolean = false;
  secretKey: string;
  userData: UserData;
  otpData: OtpData;
  resendEmailOtpTimer$: Observable<any>;
  resendOtpLoader: boolean = false;
  currentIpAddress: string = '';
  currentWebhookEvent: string = '';
  currentWebhookUrl: string = '';
  webHookDataToDelete: any = {};
  ipActionMode: string = 'ADD';
  pageLoader: boolean = false;
  developerData: DeveloperData;

  webhookEvents: any[] = [
    { name: 'Payin', value: 'PAYIN' },
    { name: 'Payout', value: 'PAYOUT' },
  ];

  ngOtpConfig = {
    allowNumbersOnly: true,
    length: 6,
    placeholder: '-',
    inputStyles: {
      width: '40px',
      height: '40px',
      border: '2px solid #008cba',
      fontSize: '18px',
    },
  };

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private apiSettingService = inject(ApiSettingService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.getUserData();
    this.getDeveloperData();
    this.createGenerateApiKeyForm();
    this.createAddIpAddressForm();
    this.createAddWebhookUrlForm();
  }

  getUserData() {
    this.authService.getMerchantDetails().subscribe({
      next: (res:AuthData) => {
        this.userData = res.data;
      this.createGenerateApiKeyForm();
      this.createAddIpAddressForm();
      this.createAddWebhookUrlForm();
      }, error: (err: HttpErrorResponse) => {
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      }
    })
  }

  getDeveloperData() {
    this.pageLoader = true;
    this.apiSettingService.getDeveloperData().subscribe({
      next: (res:DeveloperControlModel) => {
        this.pageLoader = false;
        this.developerData = res.data;
      }, error: (err: HttpErrorResponse) => {
        this.pageLoader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      }
    })
  }

  createGenerateApiKeyForm() {
    this.generateApiKeyForm = this.fb.group({
      mode: [this.userData?.onboardingMode, Validators.required],
      websiteUrl: ['', [Validators.required, secureUrlValidator()]],
    });
  }

  createAddIpAddressForm() {
    this.addIpAddressForm =
      this.ipActionMode === 'ADD' || this.ipActionMode === 'DELETE'
        ? this.fb.group({
            mode: [this.userData?.onboardingMode, Validators.required],
            ipAddress: ['', [Validators.required, ipv4AddressValidator('ADD')]],
            emailOtp: [''],
          })
        : this.fb.group({
            mode: [this.userData?.onboardingMode, Validators.required],
            ipAddress: [
              '',
              [Validators.required, ipv4AddressValidator('UPDATE')],
            ],
            emailOtp: [''],
          });
  }

  createAddWebhookUrlForm() {
    this.addWebhookUrlForm = this.fb.group({
      mode: [this.userData?.onboardingMode, Validators.required],
      url: ['', Validators.required],
      event: ['', Validators.required],
    });
  }

  get generateApiKeyFormControls() {
    return this.generateApiKeyForm.controls;
  }

  get addIpAddressFormControls() {
    return this.addIpAddressForm.controls;
  }

  get addWebhookUrlFormControls() {
    return this.addWebhookUrlForm.controls;
  }

  clearForm() {
    this.generateApiKeyForm.reset();
    this.createGenerateApiKeyForm();
    this.addIpAddressForm.reset();
    this.createAddIpAddressForm();
    this.addWebhookUrlForm.reset();
    this.createAddWebhookUrlForm();
    this.step = 1;
  }

  getCurrentWebhookEvent(event: string, url: string) {
    this.clearForm();
    this.currentWebhookEvent = event;
    this.currentWebhookUrl = url;
  }

  copy(text: string) {
    if (!text) {
      return;
    }
    
    copyText(text).then((success) => {
      if (success) {
        this.snackBar.open('Copied successfully', 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      } else {
        this.snackBar.open('Failed to copy text', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      }
    });
  }

  toggleChecked(event: Event) {
    this.isKeysSaved = (event.target as HTMLInputElement).checked;
  }

  downloadKeysInCsv(apiKey: string, secretKey: string) {
    const data = [
      {
        api_key: apiKey,
        secret_key: secretKey,
      },
    ];

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      headers: ['api_key', 'secret_key'], // Custom column names
    };

    new ngxCsv(data, 'fynzon_api_keys', options);
     this.snackBar.open('Keys downloaded successfully', 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
     }

  onOtpChange(otp: string): void {
    if (otp?.length === 6) {
      this.addIpAddressForm.get('emailOtp').setValue(otp);
    } else {
      this.addIpAddressForm.get('emailOtp').reset();
    }
  }

  //api key
  onSubmitApiKeyForm() {
    this.loader = true;

    if (this.generateApiKeyForm.invalid) {
      this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.generateApiKeyForm.get('mode').value,
      websiteURL: this.generateApiKeyForm.get('websiteUrl').value,
    };

    this.apiSettingService.generateApiKey(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.secretKey =
          this.userData?.onboardingMode === 'LIVE'
            ? response?.data?.live_api_key?.secret_key
            : response?.data?.test_api_key?.secret_key;
        this.developerData.apiSettingData = response.data;

        this.step = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  deleteApiKey(mode: string, apiKey: string) {
    this.loader = true;

    const payload = {
      mode,
      apiKey,
    };

    this.apiSettingService.deleteApiKey(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  //add ip address
  setIpAddress(ipAddress: string, purpose: string) {
    this.ipActionMode = purpose;
    this.clearForm();
    this.currentIpAddress = ipAddress;
    this.step = 1;
  }

  setWebhookDataToDelete(mode: string, url: string, event: string) {
    this.clearForm();
    this.webHookDataToDelete = {
      mode,
      url,
      event,
    };
    this.step = 1;
  }

  sendOtpToAddIpAddress() {
    this.loader = true;

    if (this.addIpAddressForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addIpAddressForm.get('mode').value,
      ipAddress: this.addIpAddressForm.get('ipAddress').value,
    };

    this.apiSettingService.sendOtptoAddIpAddress(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;

        this.addIpAddressForm
          .get('emailOtp')
          .setValidators([Validators.required]);
        this.addIpAddressForm.get('emailOtp').updateValueAndValidity();

        this.resendEmailOtpTimer$ = getTimer(300000);

        this.step = 2;
         this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  onSumbmitIpAddressForm() {
    this.loader = true;

    if (this.addIpAddressForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addIpAddressForm.get('mode').value,
      ipAddress: this.addIpAddressForm.get('ipAddress').value,
      otpId: this.otpData?.data?.otpId,
      otp: this.addIpAddressForm.get('emailOtp').value,
    };

    this.apiSettingService.verifyOtptoAddIpAddress(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 3;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  sendOtpToDeleteIpAddress(mode: string, ipAddress: string) {
    this.loader = true;

    const payload = {
      mode,
      ipAddress,
    };

    this.apiSettingService.sendOtptoRemoveIpAddress(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;

        this.addIpAddressForm
          .get('emailOtp')
          .setValidators([Validators.required]);
        this.addIpAddressForm.get('emailOtp').updateValueAndValidity();

        this.resendEmailOtpTimer$ = getTimer(300000);

        this.step = 2;
         this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  verifyOtpAndDeleteIpAddress(mode: string, ipAddress: string) {
    this.loader = true;

    const payload = {
      mode,
      ipAddress,
      otpId: this.otpData?.data?.otpId,
      otp: this.addIpAddressForm.get('emailOtp').value,
    };

    this.apiSettingService.verifyOtptoRemoveIpAddress(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 3;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  //update ip address
  sendOtpToUpdateIpAddress() {
    this.loader = true;

    if (this.addIpAddressForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addIpAddressForm.get('mode').value,
      ipAddress: this.addIpAddressForm.get('ipAddress').value,
      oldIpAddress: this.currentIpAddress,
    };

    this.apiSettingService.sendOtptoUpdateIpAddress(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;

        this.addIpAddressForm
          .get('emailOtp')
          .setValidators([Validators.required]);
        this.addIpAddressForm.get('emailOtp').updateValueAndValidity();

        this.resendEmailOtpTimer$ = getTimer(30000);

        this.step = 2;
         this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  onSumbmitUpadteIpAddress() {
    this.loader = true;

    if (this.addIpAddressForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addIpAddressForm.get('mode').value,
      ipAddress: this.addIpAddressForm.get('ipAddress').value,
      oldIpAddress: this.currentIpAddress,
      otpId: this.otpData?.data?.otpId,
      otp: this.addIpAddressForm.get('emailOtp').value,
    };

    this.apiSettingService.verifyOtptoUpdateIpAddress(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 3;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  //webhook
  addWebhookUrl() {
    this.loader = true;

    if (this.addWebhookUrlForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addWebhookUrlForm.get('mode').value,
      url: this.addWebhookUrlForm.get('url').value,
      event: this.addWebhookUrlForm.get('event').value,
    };

    this.apiSettingService.addWebHookUrl(payload).subscribe({
      next: (res: ApiSettingModel) => {
        this.loader = false;
        const response = JSON.parse(JSON.stringify(res));
        this.developerData.apiSettingData = response.data;
        this.step = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  updateWebhookUrl(oldUrl: string) {
    this.loader = true;

    if (this.addWebhookUrlForm.invalid) {
       this.snackBar.open('Please fill all the required fields', 'close', {
          duration: 5000,
          panelClass: ['warning-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      this.loader = false;
      return;
    }

    const payload = {
      mode: this.addWebhookUrlForm.get('mode').value,
      url: this.addWebhookUrlForm.get('url').value,
      event: this.addWebhookUrlForm.get('event').value,
      oldUrl: oldUrl,
    };

    this.apiSettingService.updateWebHookUrl(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  deleteWebhookUrl(webhookData: any) {
    this.loader = true;

    const payload = {
      mode: webhookData?.mode,
      url: webhookData?.url,
      event: webhookData?.event,
    };

    this.apiSettingService.removeWebHookUrl(payload).subscribe({
      next: (res: ApiSettingModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.developerData.apiSettingData = response.data;
        this.step = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
         this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  //resend-otp
  resendOtp(
    resendTo: string,
    data: { email?: string; phoneCode?: string; phone?: string } | null
  ): void {
    this.resendOtpLoader = true;

    const payload = {
      ...(resendTo === 'EMAIL' && {
        mode: 'email',
        email: data?.email,
      }),
      ...(resendTo === 'PHONE' && {
        mode: 'phone',
        phoneCode: data?.phoneCode,
        phone: data?.phone,
      }),
    };

    this.authService.resendOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.resendOtpLoader = false;
        this.otpData = response;

        this.resendEmailOtpTimer$ = getTimer(300000);
         this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.resendOtpLoader = false;
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }
}
