import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { HeaderComponent } from '../../../navigation/components/header/header';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IConfig, NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { AuthService } from '../../services/auth.service';
import { OtpData } from '../../models/otpModel';
import { Observable } from 'rxjs';
import { passwordMatchValidator } from '../../../validators/passwordMatchValidator';
import { getTimer } from '../../../utils/timer';
import { HttpErrorResponse } from '@angular/common/http';
import { UserValiadtor } from '../../../validators/userValidator';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength';
import { FixedMaskDataPipe } from '../../../pipes/mask-data.pipe';
import { NgOtpInputModule } from 'ng-otp-input';
import { RegisterPayload } from '../../types/registerPayload';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthData } from '../../models/authModel';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
  imports: [
    HeaderComponent,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PasswordStrengthComponent,
    NgOtpInputModule,
    NgxCountriesDropdownModule,
    FixedMaskDataPipe,
  ],
})
export class SignupComponent {
  buttonIndex: number;
  showVisibilityIcon: boolean = true;
  fieldTextType: boolean = false;
  fieldTextType2: boolean = false;
  registerForm: FormGroup;
  step: number = 1;
  resendEmailOtpTimer$: Observable<any>;
  resendPhoneOtpTimer$: Observable<any>;
  loader: boolean = false;
  resendOtpLoader: boolean = false;
  otpData: any;

  ngOtpConfig = {
    allowNumbersOnly: true,
    length: 6,
    placeholder: '-',
    inputStyles: {
      width: '50px',
      height: '50px',
      border: '2px solid #008cba',
      fontSize: '20px',
    },
  };
  categories: any[] = [
    {
      type: 'Business or Entity',
      value: 'ENTITY',
    },
    {
      type: 'Individual or Freelancer',
      value: 'INDIVIDUAL',
    },
  ];
  Professions: string[] = ['Teacher', 'Graphic Designer', 'Freelancer Drummer', 'Artist', 'Tutor'];
  BusinessCategory: string[] = ['Pvt. Ltd.', 'LLP', 'NGO', 'Partnership', 'Proprietorship'];

  selectedCountryConfig: IConfig = {
    hideCode: true,
    hideName: true,
  };
  countryListConfig: IConfig = {
    hideCode: true,
  };
  private formbuilder = inject(FormBuilder);
  private deviceService = inject(DeviceDetectorService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  //getter function to accesss the register form comntrols

  get registerFormControls() {
    return this.registerForm.controls;
  }

  ngOnInit(): void {
    this.checkBrowserSupport();
    this.createRegisterForm();
  }

  onCountryChange(country: any) {
    this.registerForm.get('phoneCode').patchValue(country.dialling_code);
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

  togglePasswordVisibility2(): void {
    this.fieldTextType2 = !this.fieldTextType2;
  }

  createRegisterForm(): void {
    this.registerForm = this.formbuilder.group(
      {
        category: ['', [Validators.required]],
        email: [''],
        password: [''],
        confirmPassword: [''],

        businessName: [''],
        businessCategory: [''],

        fullName: [''],
        profession: [''],

        phoneCode: ['+91'],
        phone: [''],
        acceptTerms: [''],

        otp: [''],
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword'),
      }
    );
  }

  setCategory(category: string, index: number): void {
    this.buttonIndex = index;
    this.registerForm.get('category').setValue(category);
  }

  gotoSecondStep(): void {
    //set and upadte email validators
    this.registerForm.get('email').setValidators([Validators.required, Validators.email]);

    this.registerForm.get('email').setAsyncValidators([
      UserValiadtor({
        controlName: 'email',
        services: { authservice: this.authService },
      }),
    ]);

    this.registerForm.get('email')?.updateValueAndValidity();

    //set and update password validators
    this.registerForm.get('password').setValidators([Validators.required, Validators.minLength(8)]);

    this.registerForm.get('password')?.updateValueAndValidity();

    //set and update confirmPassword validators
    this.registerForm.get('confirmPassword').setValidators([Validators.required]);

    this.registerForm.get('confirmPassword')?.updateValueAndValidity();

    this.step = 2;
  }

  gotoThirdStep(): void {
    if (this.registerForm.get('category').value === 'ENTITY') {
      //set and update businessName validators
      this.registerForm
        .get('businessName')
        .setValidators([Validators.required, Validators.minLength(5)]);
      this.registerForm.get('businessName').setAsyncValidators([
        UserValiadtor({
          controlName: 'businessName',
          services: { authservice: this.authService },
        }),
      ]);
      this.registerForm.get('businessName')?.updateValueAndValidity();

      //set and update businessCategory validators
      this.registerForm.get('businessCategory').setValidators([Validators.required]);
      this.registerForm.get('businessCategory')?.updateValueAndValidity();
    }

    if (this.registerForm.get('category').value === 'INDIVIDUAL') {
      //set and update fullName validators
      this.registerForm
        .get('fullName')
        .setValidators([Validators.required, Validators.minLength(2)]);
      this.registerForm.get('fullName')?.updateValueAndValidity();

      this.registerForm.get('profession').setValidators([Validators.required]);
      this.registerForm.get('profession')?.updateValueAndValidity();
    }

    //set and update phone validators
    this.registerForm
      .get('phone')
      .setValidators([Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]);
    this.registerForm.get('phone').setAsyncValidators([
      UserValiadtor({
        controlName: 'phone',
        services: { authservice: this.authService },
      }),
    ]);
    this.registerForm.get('phone')?.updateValueAndValidity();

    this.step = 3;
  }

  sendEmailOtp(): void {
    this.loader = true;

    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill all the required fileds', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.loader = false;
      return;
    }

    const payload: RegisterPayload = {
      category: this.registerForm.get('category')?.value,
      email: this.registerForm.get('email').value,
      password: this.registerForm.get('password')?.value,
      businessName: this.registerForm.get('businessName')?.value,
      businessCategory: this.registerForm.get('businessCategory')?.value,
      phoneCode: this.registerForm.get('phoneCode')?.value,
      phone: this.registerForm.get('phone')?.value,
      fullName: this.registerForm.get('fullName')?.value,
      profession: this.registerForm.get('profession')?.value,
    };

    this.authService.sendEmailOtp(payload).subscribe({
      next: (res: any) => {
        this.loader = false;
        const response = JSON.parse(JSON.stringify(res));
        this.otpData = response;
        this.resendEmailOtpTimer$ = getTimer(300000);
        this.step = 4;
        this.cdr.detectChanges();
        this.snackBar.open(response.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loader = false;
        this.snackBar.open(err.error.message, 'close', {
          duration: 5000,
          panelClass: ['error-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  onEmailOtpChange(otp: string) {
    if (otp?.length === 6) {
      this.registerForm.get('otp').setValue(otp);
    } else {
      this.registerForm.get('emailOtp').reset();
    }
  }

  verifyEmailOtp() {
    this.loader = true;

    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill all the required fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      this.loader = false;
      return;
    }

    const payload: RegisterPayload = {
      otpId: this.otpData.data.otpId,
      otp: this.registerForm?.get('otp')?.value,
      category: this.registerForm.get('category')?.value,
      email: this.registerForm.get('email').value,
      password: this.registerForm.get('password')?.value,
      businessName: this.registerForm.get('businessName')?.value,
      businessCategory: this.registerForm.get('businessCategory')?.value,
      phoneCode: this.registerForm.get('phoneCode')?.value,
      phone: this.registerForm.get('phone')?.value,
      fullName: this.registerForm.get('fullName')?.value,
      profession: this.registerForm.get('profession')?.value,
    };

    this.authService.register(payload).subscribe({
      next: (res: AuthData) => {
        const response = JSON.parse(JSON.stringify(res));
        this.loader = false;
        this.otpData = response;
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
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
      },
    });
  }

  resendOtp(resendTo: string): void {
    this.resendOtpLoader = true;

    const payload = {
      ...(resendTo === 'EMAIL' && {
        type: 'register',
        email: this.registerForm.get('email')?.value,
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
}
