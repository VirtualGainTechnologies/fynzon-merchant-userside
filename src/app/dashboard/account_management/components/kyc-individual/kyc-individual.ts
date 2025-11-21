import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AadharModel, BankModel, KycData, PanModel, SelfieModel } from '../../models/kycModel';

import { HttpErrorResponse } from '@angular/common/http';
import { UppercaseDirective } from '../../../../directives/uppercase.directive';
import { DisableCutCopyPasteDirective } from '../../../../directives/disable-cut-copy-paste.directive';
import { KycService } from '../../services/kyc.service';
import { bankAccMatchValidator } from '../../../../validators/kycValidators';
import { UserProfileResponse } from '../../../../auth/models/userProfileModel';
import { AuthService } from '../../../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlatformBrowserService } from '../../../../shared/services/platform-browser.service';

@Component({
  selector: 'app-kyc-individual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UppercaseDirective, DisableCutCopyPasteDirective],
  templateUrl: './kyc-individual.html',
  styleUrl: './kyc-individual.scss',
})
export class KycIndividualComponent implements OnInit, AfterViewInit {
  imgSrc: string = 'assets/icons/admin.png';
  render: string = 'aadhar';
  percentage: number = 0;
  aadharForm: FormGroup;
  panForm: FormGroup;
  bankForm: FormGroup;
  selfieForm: FormGroup;
  aadharFrontImage: File;
  aadharBackImage: File;
  panImage: File;
  chequeImage: File;
  selfieImage: File;
  errorMessage: string = '';
  formLoader: boolean = false;
  isUpdateBank: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  isSelfieUploading: boolean = false;
  kycData: KycData;
  stream!: MediaStream | null;
  capturedImage: string | null = null;
  fileList: File[] = [];
  isCamerOpened: boolean = false;
  pageLoader: boolean = false;

  private fb = inject(FormBuilder);
  private kycService = inject(KycService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private platform = inject(PlatformBrowserService);

  constructor() {}

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.createAadharForm();
    this.createPanForm();
    this.createBankForm();
    if (this.platform.isBrowser) {
      this.getKycData();
    }
  }

  ngAfterViewInit(): void {
    console.log('this.vide', this.video);
  }

  createAadharForm() {
    this.aadharForm = this.fb.group({
      aadhaarNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/),
      ]),
      aadharFrontImage: new FormControl('', [Validators.required]),
      aadharBackImage: new FormControl('', [Validators.required]),
    });
  }

  get aadharFormControls() {
    return this.aadharForm.controls;
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
        this.kycData?.aadhaar?.status === 'VERIFIED' &&
        this.kycData?.pan?.status === 'VERIFIED' &&
        this.kycData?.bank?.status === 'VERIFIED' &&
        this.kycData?.selfie?.status === 'VERIFIED' &&
        this.kycData?.kycStatus === 'VERIFIED'
          ? ((this.percentage = 100), (this.render = 'kycCompleted'))
          : this.kycData?.aadhaar?.status === 'VERIFIED' &&
            this.kycData?.pan?.status === 'VERIFIED' &&
            this.kycData?.bank?.status === 'VERIFIED'
          ? ((this.percentage = 75), (this.render = 'bank'))
          : this.kycData?.aadhaar?.status === 'VERIFIED' && this.kycData?.pan?.status === 'VERIFIED'
          ? ((this.percentage = 50), (this.render = 'pan'))
          : this.kycData?.aadhaar?.status === 'VERIFIED'
          ? ((this.percentage = 25), (this.render = 'aadhar'))
          : ((this.percentage = 0), (this.render = 'aadhar'));

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
        fileList[0].type !== 'image/jpg' &&
        fileList[0].type !== 'image/jpeg' &&
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
      case 'aadharFrontImage-success':
        this.aadharFrontImage = fileList[0];
        break;
      case 'aadharFrontImage-error':
        this.aadharForm.get('aadharFrontImage').reset();
        break;
      case 'aadharBackImage-success':
        this.aadharBackImage = fileList[0];
        break;
      case 'aadharBackImage-error':
        this.aadharForm.get('aadharBackImage').reset();
        break;
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
      case 'selfieImage-success':
        this.selfieImage = fileList[0];
        break;
      case 'selfieImage-error':
        this.selfieForm.get('selfieImage').reset();
        break;
    }
  }

  onSelfieInputClick(fileUpload: HTMLInputElement) {
    fileUpload.click();
  }

  clearPreview(fileInput: HTMLInputElement): void {
    this.imagePreview = null; // Clear the preview
    fileInput.value = ''; // Reset the file input value
  }

  onAadhaarFormSubmit() {
    this.formLoader = true;

    if (this.aadharForm.invalid) {
      this.errorMessage = 'Please fill all the required fileds';
      return;
    }

    const formData: FormData = new FormData();
    formData.append('aadhaarNumber', this.aadharForm.get('aadhaarNumber')?.value);
    formData.append('aadhaarFront', this.aadharFrontImage);
    formData.append('aadhaarBack', this.aadharBackImage);

    this.kycService.verifyAadhaar(formData).subscribe({
      next: (res: AadharModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;

        // this.store.dispatch(
        //   accountActions.updateAadhaar({ aadhaarData: response?.data }),
        // );
        this.getKycData();

        this.aadharForm.reset();
        this.percentage = 25;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        this.formLoader = false;
        this.errorMessage = err?.error?.message || 'Something went wrong';
        this.aadharForm.get('aadharFrontImage').reset();
        this.aadharForm.get('aadharBackImage').reset();
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

    this.kycService.verifyIndividualPan(formData).subscribe({
      next: (res: PanModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;

        // this.store.dispatch(
        //   accountActions.updatePan({ panData: response?.data }),
        // );
        this.getKycData();

        this.panForm.reset();
        this.percentage = 50;
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
        this.percentage =
          this.isUpdateBank && this.kycData?.selfie?.status === 'VERIFIED' ? 100 : 75;
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
      case 'aadhar':
        this.aadharForm.get('aadharFrontImage').reset();
        this.aadharForm.get('aadharBackImage').reset();
        break;
      case 'pan':
        this.panForm.get('panImage').reset();
        break;
      case 'bank':
        this.bankForm.get('chequeImage').reset();
        break;
      case 'selfie':
        this.selfieForm.get('selfieImage').reset();
        break;
    }
  }

  //web cam related
  async startCamera() {
    try {
      this.isCamerOpened = true;
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error('Could not start camera', err);
    }
  }

  stopCamera() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.isCamerOpened = false;
    this.capturedImage = null;
    this.stream = null;
  }

  captureImage() {
    const videoEl = this.video.nativeElement;
    const canvasEl = this.canvas.nativeElement;
    const context = canvasEl.getContext('2d');

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    // if (context) {
    //   context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    //   this.capturedImage = canvasEl.toDataURL('image/png');
    // }

    if (context) {
      context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
      canvasEl.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-image.png', {
            type: blob.type,
          });
          this.selfieImage = file;
          //this.fileList = [file]; // mimic FileList
          this.capturedImage = URL.createObjectURL(file); // for preview
        }
      }, 'image/png');
    }
  }

  uploadSelfieImage() {
    this.formLoader = true;

    if (!this.capturedImage) {
      this.errorMessage = 'Please upload selfie';
      return;
    }

    const formData: FormData = new FormData();
    formData.append('selfieImage', this.selfieImage);

    this.kycService.verifySelfie(formData).subscribe({
      next: (res: SelfieModel) => {
        const response = JSON.parse(JSON.stringify(res));
        this.formLoader = false;
        this.imagePreview = '';

        // this.store.dispatch(
        //   accountActions.updateSelfie({ selfieData: response?.data }),
        // );

        this.getKycData();

        this.stream?.getTracks().forEach((track) => track.stop());
        this.isCamerOpened = false;
        this.capturedImage = null;
        this.stream = null;
        this.percentage = 100;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        this.formLoader = false;
        this.stream?.getTracks().forEach((track) => track.stop());
        this.isCamerOpened = false;
        this.capturedImage = null;
        this.stream = null;
        this.errorMessage = err?.error?.message || 'Something went wrong';
      },
    });
  }

  dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }
}
