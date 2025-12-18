import { CommonModule } from '@angular/common';
import { Component,  inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { PasswordStrengthComponent } from '../../../../shared/components/password-strength/password-strength';
import { FixedMaskDataPipe } from '../../../../pipes/mask-data.pipe';
import { RouterModule } from '@angular/router';
import { OtpData } from '../../../../auth/models/otpModel';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../auth/services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AccountSettingService } from '../../services/account-setting.service';
import { passwordMatchValidator } from '../../../../validators/passwordMatchValidator';
import { HttpErrorResponse } from '@angular/common/http';
import { getTimer } from '../../../../utils/timer';
import { UserValiadtor } from '../../../../validators/userValidator';
import { AuthData } from '../../../../auth/models/authModel';
import { NullData } from '../../../../shared/models/nullDataModel';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DisableCutCopyPasteDirective } from '../../../../directives/disable-cut-copy-paste.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { createInititals, getInitialsColor } from '../../../../utils/nameInitials';
import { UploadSelfieResponse } from '../../models/account-setting-model';
import { UserData } from '../../../../auth/models/userModel';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.html',
  styleUrls: ['./account-setting.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DisableCutCopyPasteDirective,
    NgOtpInputModule,
    PasswordStrengthComponent,
    FixedMaskDataPipe,
    RouterModule,
    MatTooltip,
  ],
})
export class AccountSettingComponnet {
  showVisibilityIcon: boolean = true;
  fieldTextType: boolean = false;
  imgSrc: string = 'assets/icons/admin.png';
  errorMessage: String = '';
  imagePreview: string | ArrayBuffer | null = null;
  selfieImage: File;
  counter: number = 0;
  modes: any = {};
  loader: boolean = false;
  modalStep: number = 1;
  changeMobileForm: FormGroup;
  changeEmailForm: FormGroup;
  changePasswordForm: FormGroup;
  otpData: OtpData;
  resendOtpLoader: boolean = false;
  resendEmailOtpTimer$: Observable<any>;
  resendPhoneOtpTimer$: Observable<any>;
  changeEmailModalLoader: boolean = false;
  changePhoneModalLoader: boolean = false;
  passwordErrorMessage: string = '';
  pageLoader: boolean = true;
  userData: UserData;

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
  private deviceService = inject(DeviceDetectorService);
  private accountSettingService = inject(AccountSettingService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private platform = inject(PlatformBrowserService);

  constructor() {}

  ngOnInit(): void {
    this.createChangeMobileForm();
    this.createChangeEmailForm();
    this.createChangePasswordForm();
    this.checkBrowserSupport();
    if (this.platform.isBrowser) {
      this.getMerchantDetails();
    }
  }

  checkBrowserSupport(): void {
    if (
      this.deviceService.browser === 'MS-Edge-Chromium' ||
      this.deviceService.browser === 'MS-Edge' ||
      this.deviceService.browser === 'Edge' ||
      this.deviceService.browser === 'Safari'
    ) {
      this.showVisibilityIcon = false;
    }
  }

  togglePasswordVisibility(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  createChangeMobileForm() {
    this.changeMobileForm = this.fb.group({
      emailOtp: ['', [Validators.required]],
      phoneCode: ['91', [Validators.required]],
      phone: [''],
      mobileOtp: [''],
    });
  }

  get changeMobileFormControllers() {
    return this.changeMobileForm.controls;
  }

  createChangeEmailForm() {
    this.changeEmailForm = this.fb.group({
      mobileOtp: [''],
      email: [''],
      emailOtp: [''],
    });
  }

  get changeEmailFormControllers() {
    return this.changeEmailForm.controls;
  }

  createChangePasswordForm() {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        emailOtp: [''],
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  get changePasswordFormControllers() {
    return this.changePasswordForm.controls;
  }

  clearChangeMobileForm() {
    this.changeMobileForm.reset();
    this.createChangeMobileForm();
    this.modalStep = 1;
  }

  clearChangeEmailForm() {
    this.changeEmailForm.reset();
    this.createChangeEmailForm();
    this.modalStep = 1;
  }

  clearChangePasswordForm() {
    this.passwordErrorMessage = '';
    this.changePasswordForm.reset();
    this.createChangePasswordForm();
    this.modalStep = 1;
  }

  //update-selfie
  onSelfieInputClick(fileUpload: HTMLInputElement) {
    fileUpload.click();
  }

  clearPreview(fileInput: HTMLInputElement): void {
    this.imagePreview = null; // Clear the preview
    fileInput.value = ''; // Reset the file input value
  }

  onSelfieUpload(event: Event) {
    this.errorMessage = '';
    const input = event.target as HTMLInputElement;
    const fileList: FileList = input?.files;

    if (fileList?.length <= 0) {
      this.imagePreview = null; // Clear the preview
      input.value = ''; // Reset the file input value
      this.snackBar.open('You must select an image to upload', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
    }

    //check file type
    if (
      fileList[0].type !== 'image/jpeg' &&
      fileList[0].type !== 'image/jpg' &&
      fileList[0].type !== 'image/png'
    ) {
      this.imagePreview = null; // Clear the preview
      input.value = ''; // Reset the file input value
      this.snackBar.open('Image must be in .jpeg or .jpg or .png format.', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      return;
    }

    //check file size
    if (fileList[0].size > 10 * 1024 * 1024) {
      this.imagePreview = null; // Clear the preview
      input.value = ''; // Reset the file input value
      this.snackBar.open('File size exceeds 10MB. Please select a smaller file.', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      return;
    }

    this.selfieImage = fileList[0];

    const reader = new FileReader();
    reader.readAsDataURL(this.selfieImage);
    reader.onload = (e) => {
      this.imagePreview = reader.result;
    };
  }

  onSelfieSubmit(fileInput: HTMLInputElement) {
    this.errorMessage = '';
    this.loader = true;

    if (!this.selfieImage) {
      this.snackBar.open('Please upload an image', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
    }

    const formData: FormData = new FormData();
    formData.append('image', this.selfieImage);

    this.accountSettingService.uploadSelfie(formData).subscribe({
      next: (res: UploadSelfieResponse) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.imagePreview = '';

        this.getMerchantDetails();

        // this.store.dispatch(authActions.updateUser({ userData: response?.data }));

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
        this.imagePreview = null; // Clear the preview
        fileInput.value = ''; // Reset the file input value
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  getUserInitials(merchantType: string, userName: string) {
    const userInitials = createInititals(merchantType, userName);
    const initialsColor = getInitialsColor(userName);
    return {
      userInitials,
      initialsColor,
    };
  }

  //otp-change-controller
  onOtpChange(formType: string, mode: string, otp: string): void {
    if (otp?.length === 6) {
      formType === 'change-mobile' && mode === 'EMAIL'
        ? this.changeMobileForm.get('emailOtp').setValue(otp)
        : formType === 'change-mobile' && mode === 'PHONE'
        ? this.changeMobileForm.get('mobileOtp').setValue(otp)
        : formType === 'change-email' && mode === 'EMAIL'
        ? this.changeEmailForm.get('emailOtp').setValue(otp)
        : formType === 'change-email' && mode === 'PHONE'
        ? this.changeEmailForm.get('mobileOtp').setValue(otp)
        : formType === 'change-password' && mode === 'EMAIL'
        ? this.changePasswordForm.get('emailOtp').setValue(otp)
        : '';
    } else {
      formType === 'change-mobile' && mode === 'EMAIL'
        ? this.changeMobileForm.get('emailOtp').reset()
        : formType === 'change-mobile' && mode === 'PHONE'
        ? this.changeMobileForm.get('mobileOtp').reset()
        : formType === 'change-email' && mode === 'EMAIL'
        ? this.changeEmailForm.get('emailOtp').reset()
        : formType === 'change-email' && mode === 'PHONE'
        ? this.changeEmailForm.get('mobileOtp').reset()
        : formType === 'change-password' && mode === 'EMAIL'
        ? this.changePasswordForm.get('emailOtp').reset()
        : '';
    }
  }

  //update-mobile
  sendEmailOtpForMobileChange(email: string) {
    this.loader = true;
    this.changePhoneModalLoader = true;

    const payload = {
      email,
    };

    this.accountSettingService.sendEmailOtpForMobileChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.changePhoneModalLoader = false;
        this.otpData = response;

        this.resendEmailOtpTimer$ = getTimer(300000);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });

        this.modalStep = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
        this.changePhoneModalLoader = false;
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  verifyEmailOtpForMobileChange(email: string) {
    this.loader = true;

    const payload = {
      otpId: this.otpData?.data?.otpId,
      otp: this.changeMobileForm.get('emailOtp').value,
      email,
    };

    this.accountSettingService.verifyEmailOtpForMobileChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.loader = false;

        this.changeMobileForm
          .get('phone')
          .setValidators([Validators.required, Validators.pattern(/^[6-9]{1}[0-9]{9}$/)]);
        this.changeMobileForm.get('phone').setAsyncValidators([
          UserValiadtor({
            controlName: 'phone',
            services: { authservice: this.authService },
          }),
        ]);

        this.changeMobileForm.get('phone').updateValueAndValidity();

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.modalStep = 3;
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

  sendMobileOtpForMobileChange() {
    this.loader = true;

    const payload = {
      phoneCode: this.changeMobileForm.get('phoneCode').value,
      phone: this.changeMobileForm.get('phone').value,
    };

    this.accountSettingService.sendMobileOtpForMobileChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.loader = false;

        this.changeMobileForm.get('mobileOtp').setValidators([Validators.required]);

        this.changeMobileForm.get('mobileOtp').updateValueAndValidity();

        this.resendPhoneOtpTimer$ = getTimer(300000);

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.modalStep = 4;
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

  onSubmitChangeMobileForm() {
    this.loader = true;

    const payload = {
      otpId: this.otpData?.data?.otpId,
      otp: this.changeMobileForm.get('mobileOtp').value,
      phoneCode: this.changeMobileForm.get('phoneCode').value,
      phone: this.changeMobileForm.get('phone').value,
    };

    this.accountSettingService.changeMobileNumber(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.getMerchantDetails();

        // this.store.dispatch(authActions.updateUser({ userData: response.data }));

        this.modalStep = 5;
        
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

  //update-email
  sendMobileOtpForEmailChange(phoneCode: string, phone: string) {
    this.changeEmailModalLoader = true;

    const payload = {
      phoneCode,
      phone,
    };

    this.accountSettingService.sendMobileOtpForEmailChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));

        this.changeEmailModalLoader = false;

        this.otpData = response;

        this.changeEmailForm.get('mobileOtp').setValidators([Validators.required]);

        this.changeEmailForm.get('mobileOtp').updateValueAndValidity();

        this.resendPhoneOtpTimer$ = getTimer(300000);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.changeEmailModalLoader = false;
        this.snackBar.open(err?.error?.message || 'Something went wrong', 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  verifyMobileOtpForEmailChange(phoneCode: string, phone: string) {
    this.loader = true;

    const payload = {
      otpId: this.otpData?.data?.otpId,
      otp: this.changeEmailForm.get('mobileOtp').value,
      phoneCode,
      phone,
    };

    this.accountSettingService.verifyMobileOtpForEmailChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.loader = false;

        this.changeEmailForm.get('email').setValidators([Validators.required, Validators.email]);

        this.changeEmailForm.get('email').setAsyncValidators([
          UserValiadtor({
            controlName: 'email',
            services: { authservice: this.authService },
          }),
        ]);

        this.changeEmailForm.get('email').updateValueAndValidity();
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.modalStep = 2;
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

  sendEmailOtpForEmailChange() {
    this.loader = true;

    const payload = {
      email: this.changeEmailForm.get('email').value,
    };

    this.accountSettingService.sendEmailOtpForEmailChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.loader = false;

        this.changeEmailForm.get('emailOtp').setValidators([Validators.required]);

        this.changeEmailForm.get('emailOtp').updateValueAndValidity();

        this.resendEmailOtpTimer$ = getTimer(300000);

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.modalStep = 3;
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

  onSubmitChangeEmailForm() {
    this.loader = true;

    const payload = {
      otpId: this.otpData?.data?.otpId,
      otp: this.changeEmailForm.get('emailOtp').value,
      email: this.changeEmailForm.get('email').value,
    };

    this.accountSettingService.changeEmailId(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.getMerchantDetails();

        // this.store.dispatch(authActions.updateUser({ userData: response.data }));

        this.modalStep = 4;
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

  //update-password
  sendOtpToChangePassword() {
    this.loader = true;

    const payload = {
      currentPassword: this.changePasswordForm.get('currentPassword').value,
      newPassword: this.changePasswordForm.get('password').value,
    };

    this.accountSettingService.sendOtpForPasswordChange(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.loader = false;

        this.changePasswordForm.get('emailOtp').setValidators([Validators.required]);

        this.changePasswordForm.get('emailOtp').updateValueAndValidity();

        this.resendEmailOtpTimer$ = getTimer(300000);

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.modalStep = 2;
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
        this.passwordErrorMessage = err?.error?.message || 'Something went wrong';
      },
    });
  }

  onSubmitChangePasswordForm() {
    this.loader = true;

    const payload = {
      otpId: this.otpData?.data?.otpId,
      otp: this.changePasswordForm.get('emailOtp').value,
      currentPassword: this.changePasswordForm.get('currentPassword').value,
      newPassword: this.changePasswordForm.get('password').value,
    };

    this.accountSettingService.updatePassword(payload).subscribe({
      next: (res: NullData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.modalStep = 3;
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
        email: this.changeMobileForm.get('email')?.value || data?.email,
      }),
      ...(resendTo === 'PHONE' && {
        phoneCode: this.changeMobileForm.get('phoneCode')?.value || data?.phoneCode,
        phone: this.changeMobileForm.get('phone')?.value || data?.phone,
      }),
    };

    this.authService.resendOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.resendOtpLoader = false;
        this.otpData = response;

        response.data?.email
          ? (this.resendEmailOtpTimer$ = getTimer(300000))
          : (this.resendPhoneOtpTimer$ = getTimer(300000));

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

  getMerchantDetails() {
    this.pageLoader = true;
    this.authService.getMerchantDetails().subscribe({
      next: (res: AuthData) => {
        this.pageLoader = false;
        const response = JSON.parse(JSON.stringify(res));
        this.userData = response.data;
      },
      error: (err: HttpErrorResponse) => {
        this.pageLoader = false;
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
