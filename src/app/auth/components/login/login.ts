import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';

import { HeaderComponent } from '../../../navigation/components/header/header';
import { FixedMaskDataPipe } from '../../../pipes/mask-data.pipe';
import { NgOtpInputModule } from 'ng-otp-input';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OtpData } from '../../models/otpModel';
import { HttpErrorResponse } from '@angular/common/http';
import { getTimer } from '../../../utils/timer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalStoreService } from '../../../shared/services/localStorage.service';
import { AuthData } from '../../models/authModel';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [
    CommonModule,
    HeaderComponent,
    ReactiveFormsModule,
    FixedMaskDataPipe,
    NgOtpInputModule,
    RouterModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  fieldTextType: boolean = true;
  showVisibilityIcon: boolean = true;
  step: number = 1;
  ngOtpConfig = {
    allowNumbersOnly: true,
    length: 6,
    placeholder: '-',
    inputStyles: {
      width: '50px',
      height: '50px',
      marginRight: '20px',
      border: '2px solid #008cba',
      fontSize: '20px',
    },
  };
  resendOtpLoader: boolean = false;
  loader: boolean = false;
  otpData: OtpData;
  resendOtpTimer$!: Observable<any>;

  //dependacies
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private deviceService = inject(DeviceDetectorService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private localStoreService = inject(LocalStoreService);
  ngOnInit(): void {
    this.createLoginForm();
  }

  //creating login form
  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      otp: [''],
    });
  }

  //geter function to access controls of the login FormBuilder
  get loginFormControls() {
    return this.loginForm.controls;
  }

  //show and hide password function
  togglePasswordVisibility() {
    this.fieldTextType = !this.fieldTextType;
  }

  //browser detection serveice
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

  sendOtp(): void {
    this.loader = true;

    if (this.loginForm.invalid) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['error-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.loader = false;
      return;
    }

    const payload = {
      email: this.loginForm?.get('email')?.value,
      password: this.loginForm?.get('password')?.value,
    };

    this.authService.sendLoginOtp(payload).subscribe({
      next: (res: OtpData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;
        this.localStoreService.setData('userState', true, 1, 'h');
        this.loginForm.get('otp').setValidators([Validators.required]);
        this.loginForm.get('otp').updateValueAndValidity();
        

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
      this.loginForm.get('otp').setValue(otp);
    } else {
      this.loginForm.get('otp').reset();
    }
  }

  resendOtp(resendTo: string): void {
    this.resendOtpLoader = true;

    const payload = {
      type: 'login',
      email: this.loginForm.get('email')?.value,
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

  submitLoginForm(): void {
    this.loader = true;

    if (this.loginForm.invalid) {
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
      email: this.loginForm.get('email').value,
      otpId: this.otpData?.data?.otpId,
      otp: this.loginForm?.get('otp')?.value,
    };

    this.authService.login(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;
        this.localStoreService.setData('userState', true, 1, 'h');
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.router.navigate(['/dashboard']);
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
}
