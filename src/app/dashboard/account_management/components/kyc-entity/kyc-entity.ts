import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DisableCutCopyPasteDirective } from '../../../../directives/disable-cut-copy-paste.directive';
import { KycService } from '../../services/kyc.service';
import { BankModel, GstModel, KycData, PanModel } from '../../models/kycModel';
import { bankAccMatchValidator, gstinMatchValidator } from '../../../../validators/kycValidators';
import { UppercaseDirective } from '../../../../directives/uppercase.directive';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserProfileResponse } from '../../../../auth/models/userProfileModel';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-kyc-entity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UppercaseDirective, DisableCutCopyPasteDirective],
  templateUrl: './kyc-entity.html',
  styleUrl: './kyc-entity.scss',
})
export class KycEntityComponent implements OnInit {
  render: string = 'gst';
  percentage: number = 0;
  gstinForm: FormGroup;
  panForm: FormGroup;
  bankForm: FormGroup;
  panImage: File;
  chequeImage: File;
  errorMessage: string = '';
  formLoader: boolean = false;
  isUpdateBank: boolean = false;
  kycData: KycData;
  pageLoader: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private kycService = inject(KycService);
  private platform = inject(PlatformBrowserService);
  private snackBar = inject(MatSnackBar);

  constructor() {}

  ngOnInit() {
    this.createGstForm();
    this.createPanForm();
    this.createBankForm();
    if (this.platform.isBrowser) {
      this.getKycData();
    }
  }

  createGstForm() {
    this.gstinForm = this.fb.group(
      {
        gstinNumber: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
        ]),
        confirmGstinNumber: new FormControl('', [Validators.required]),
      },
      {
        validators: gstinMatchValidator('gstinNumber', 'confirmGstinNumber'),
      }
    );
  }

  get gstinFormControls() {
    return this.gstinForm.controls;
  }

  createPanForm() {
    this.panForm = this.fb.group({
      panNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
      ]),
      panImage: new FormControl('', [Validators.required]),
    });
  }

  get panFormControls() {
    return this.panForm.controls;
  }

  createBankForm() {
    this.bankForm = this.fb.group(
      {
        ifscCode: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
        ]),
        accNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9,18}$/)]),
        confirmAccNumber: new FormControl('', [Validators.required]),
        chequeImage: new FormControl('', [Validators.required]),
      },
      {
        validators: bankAccMatchValidator('accNumber', 'confirmAccNumber'),
      }
    );
  }

  get bankFormControls() {
    return this.bankForm.controls;
  }

  getKycData() {
    this.pageLoader = true;
    this.authService.getUserProfile().subscribe({
      next: (res: UserProfileResponse) => {
        this.pageLoader = false;
        const response = JSON.parse(JSON.stringify(res));
        this.kycData = response.data;
        //set progress bar and render
        this.kycData?.gst?.status === 'VERIFIED' &&
        this.kycData?.pan?.status === 'VERIFIED' &&
        this.kycData?.bank?.status === 'VERIFIED' &&
        this.kycData?.kycStatus === 'VERIFIED'
          ? ((this.percentage = 100), (this.render = 'kycCompleted'))
          : this.kycData?.gst?.status === 'VERIFIED' && this.kycData?.pan?.status === 'VERIFIED'
          ? ((this.percentage = 66), (this.render = 'pan'))
          : this.kycData?.gst?.status === 'VERIFIED'
          ? ((this.percentage = 33), (this.render = 'gst'))
          : ((this.percentage = 0), (this.render = 'gst'));

        // Prefill the bank form with the fetched data
        this.bankForm?.patchValue({
          ifscCode: this.kycData?.bank?.ifscCode,
          accNumber: this.kycData?.bank?.accountNumber,
        });
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

  onFileChange(event: Event, fileType: string, fileSizeInMb: number) {
    const input = event.target as HTMLInputElement;
    const fileList: FileList = input?.files;

    if (fileList?.length > 0) {
      //check file type
      if (
        fileList[0].type !== 'image/jpeg' &&
        fileList[0].type !== 'image/jpg' &&
        fileList[0].type !== 'image/png'
      ) {
        this.errorMessage = 'Image must be in .jpg, .jpeg or .png format.';
        this.manageFile(fileList, fileType, 'error');
        return;
      }

      //check file size
      if (fileList[0].size > fileSizeInMb * 1024 * 1024) {
        this.errorMessage = `File size exceeds ${fileSizeInMb}MB. Please select a smaller file.`;
        this.manageFile(fileList, fileType, 'error');
        return;
      }

      this.manageFile(fileList, fileType, 'success');
    }
  }

  manageFile(fileList: FileList, fileType: string, resultType: string) {
    const key = `${fileType}-${resultType}`;

    //set file type
    switch (key) {
      case 'panImage-success':
        this.panImage = fileList[0];
        break;
      case 'panImage-error':
        this.panForm.get('panImage').reset();
        break;
      case 'chequeImage-success':
        this.chequeImage = fileList[0];
        break;
      case 'chequeImage-error':
        this.bankForm.get('chequeImage').reset();
        break;
    }
  }

  onGstFormSubmit() {
    this.formLoader = true;

    if (this.gstinForm.invalid) {
      this.errorMessage = 'Please fill all the required fileds';
      return;
    }

    const payload = {
      gstinNumber: this.gstinForm.get('gstinNumber')?.value,
    };

    this.kycService.verifyGst(payload).subscribe({
      next: (res: GstModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;

        // this.store.dispatch(
        //   accountActions.updateGst({ gstData: response?.data }),
        // );
        this.getKycData();
        this.gstinForm.reset();
        this.percentage = 33;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        this.formLoader = false;
        this.errorMessage = err?.error?.message || 'Something went wrong';
      },
    });
  }

  onPanFormSubmit() {
    this.formLoader = true;
    if (this.panForm.invalid) {
      this.errorMessage = 'Please fill all the required fileds';
      return;
    }

    const formData: FormData = new FormData();
    formData.append('panNumber', this.panForm.get('panNumber')?.value);
    formData.append('panImage', this.panImage);

    this.kycService.verifyBusinessPan(formData).subscribe({
      next: (res: PanModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;

        // this.store.dispatch(
        //   accountActions.updatePan({ panData: response?.data }),
        // );
        this.getKycData();
        this.panForm.reset();
        this.percentage = 66;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        this.formLoader = false;
        this.errorMessage = err?.error?.message || 'Something went wrong';
        this.panForm.get('panImage').reset();
      },
    });
  }

  onBankFormSubmit() {
    this.formLoader = true;
    if (this.bankForm.invalid) {
      this.errorMessage = 'Please fill all the required fileds';
      return;
    }

    const formData: FormData = new FormData();
    formData.append('ifscCode', this.bankForm.get('ifscCode')?.value);
    formData.append('bankAccNo', this.bankForm.get('accNumber')?.value);
    formData.append('chequeImage', this.chequeImage);

    this.kycService.verifyBank(formData).subscribe({
      next: (res: BankModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;

        // this.store.dispatch(
        //   accountActions.updateBank({ bankData: response?.data }),
        // );
        this.getKycData();

        this.bankForm.reset();
        this.percentage = 100;
        this.isUpdateBank = false;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        this.formLoader = false;
        this.errorMessage = err?.error?.message || 'Something went wrong';
        this.bankForm.get('chequeImage').reset();
      },
    });
  }

  onUpdateBankClick() {
    this.isUpdateBank = true;
  }

  onCancelUpdateBankClick() {
    this.errorMessage = '';
    this.isUpdateBank = false;
  }

  onRender(render: string, currentScreen?: string) {
    this.render = render;
    this.errorMessage = '';

    switch (currentScreen) {
      case 'pan':
        this.panForm.get('panImage').reset();
        break;
      case 'bank':
        this.bankForm.get('chequeImage').reset();
        break;
    }
  }
}
