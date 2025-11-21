import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgOtpInputModule } from 'ng-otp-input';

import { HeaderComponent } from '../../../navigation/components/header/header';
import { AuthService } from '../../services/auth.service';
import { OtpData } from '../../models/otpModel';
import { AuthData } from '../../models/authModel';
import { passwordMatchValidator } from '../../../validators/passwordMatchValidator';
import { getTimer } from '../../../utils/timer';
import { FixedMaskDataPipe } from '../../../pipes/mask-data.pipe';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    RouterModule,
    FixedMaskDataPipe,
    PasswordStrengthComponent,
    ReactiveFormsModule,
    NgOtpInputModule,
  ],
})
export class ForgotPasswordComponent {
  lockImg: string = 'assets/icons/lock_img.png';
  indiaFlag: string = 'assets/images/india-flag-icon.png';
  showVisibilityIcon: boolean = true;
  fieldTextType: boolean = false;
  fieldTextType2: boolean = false;
  step: number = 1;
  changePasswordForm: FormGroup;
  formSubmitted: boolean = false;
  resendOtpTimer$!: Observable<any>;
  loader: boolean = false;
  resendOtpLoader: boolean = false;
  otpData!: OtpData;
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

  private deviceService = inject(DeviceDetectorService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.checkBrowserSupport();
  }

  ngOnInit(): void {
    this.createChangePasswordForm();
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

  togglePasswordVisibility1(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  togglePasswordVisibility2(): void {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  createChangePasswordForm(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        otp: [],
        password: [],
        confirmPassword: [],
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  get changePasswordFormControls() {
    return this.changePasswordForm.controls;
  }

  setPasswordMode(mode: string) {
    this.createChangePasswordForm();
  }

  sendOtp(): void {
    this.loader = true;

    if (this.changePasswordForm.invalid) {
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
      email: this.changePasswordForm?.get('email')?.value,
    };

    this.authService.sendForgotPasswordOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;

        this.changePasswordForm.get('otp').setValidators([Validators.required]);
        this.changePasswordForm.get('otp').updateValueAndValidity();

        this.resendOtpTimer$ = getTimer(300000);
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
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

  onOtpChange(otp: string): void {
    if (otp?.length === 6) {
      this.changePasswordForm.get('otp').setValue(otp);
    } else {
      this.changePasswordForm.get('otp').reset();
    }
  }

  verifyOtp(): void {
    this.loader = true;

    if (this.changePasswordForm.invalid) {
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
      otpId: this.otpData?.data?.otpId,
      otp: this.changePasswordForm?.get('otp')?.value,
    };

    this.authService.verifyForgotPasswordOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;

        this.changePasswordForm
          .get('password')
          .setValidators([Validators.required, Validators.minLength(8)]);
        this.changePasswordForm.get('password').updateValueAndValidity();

        this.changePasswordForm.get('confirmPassword').setValidators([Validators.required]);
        this.changePasswordForm.get('confirmPassword').updateValueAndValidity();

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
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

  submitChangePasswordForm() {
    this.loader = true;

    if (this.changePasswordForm.invalid) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.loader = false;
      return;
    }
    this.changePassword();
  }

  changePassword() {
    const payload = {
      email: this.changePasswordForm.get('email').value,
      newPassword: this.changePasswordForm.get('password').value,
    };

    this.authService.changePassword(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;

        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.router.navigate(['/']);
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

  resendOtp(resendTo: string): void {
    this.resendOtpLoader = true;

    const payload = {
      type: 'reset password',
      email: this.changePasswordForm.get('email')?.value,
    };

    this.authService.resendOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.resendOtpLoader = false;

        this.otpData = response;

        this.resendOtpTimer$ = getTimer(300000);
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
