import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataHandlingService, invoiceFormData } from '../../services/dataHanling.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentService } from '../../services/payment.service';
import { UserData } from '../../../../auth/models/userModel';
import { LocalStorageService } from 'angular-web-storage';
import { AuthService } from '../../../../auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfileResponse } from '../../../../auth/models/userProfileModel';
import { KycData } from '../../../account_management/models/kycModel';
import { SendInvoiceEmailResponse } from '../../models/sendInvoieEmailResponse';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../../../environment/environment';

@Component({
  selector: 'app-preview-invoice-data',
  standalone: true,
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatProgressBarModule,
  ],
})
export class Preview {
  @ViewChild('invoiceTemplate') invoiceTemplate!: ElementRef;
  @ViewChild('closeBtn') CloseBtn!: ElementRef;
  invoiceFormData: invoiceFormData;
  qrImage: string = 'assets/icons/qrCode.png';
  pdfFile: File;
  pdfPreview: string;
  sendInvoiceForm: FormGroup;
  merchantDetails: UserData;
  kycData: KycData;
  spinner: boolean = false;
  loader: boolean = false;
  baseUrl: string = environment.apiUrl;
  builder: boolean = false;

  //dependancies
  private dataService = inject(DataHandlingService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private localStroageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.createInvoiceForm();
    this.getInvoiceData();
    this.getKycData();
    this.merchantDetails = this.localStroageService.get('userData');
  }

  createInvoiceForm() {
    this.sendInvoiceForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      invoice: ['', Validators.required],
    });
  }

  getInvoiceData() {
    this.dataService.formData.subscribe({
      next: (res: any) => {
        this.invoiceFormData = res;
      },
      error: (err: any) => {
        console.error('Data not available!');
      },
    });
  }

  getKycData() {
    this.authService.getUserProfile().subscribe({
      next: (res: UserProfileResponse) => {
        const response = JSON.parse(JSON.stringify(res));
        this.kycData = response.data;
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

  uploadFile(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const type = file.type;
    const size = Math.round(file.size / 10240);

    if (type !== 'application/pdf') {
      this.snackBar.open('File must be in PDF format.', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      event.target.value = '';
      return;
    }

    if (size > 1024) {
      this.snackBar.open('PDF size must be less than 10 MB.', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      event.target.value = '';
      return;
    }
    this.pdfFile = file;
    this.pdfPreview = URL.createObjectURL(file); // for preview (iframe)

    event.target.value = '';
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

  getFileName(): string {
    if (!this.pdfFile) return '';
    const name = this.pdfFile.name.replace('.pdf', '');
    if (name.length <= 15) {
      return `${name}.pdf`;
    }
    return `${name.slice(0, 15)}... .pdf`;
  }

  DownloadInvoice() {
    this.loader = true;
    const html = this.invoiceTemplate.nativeElement.outerHTML;
    const fileName = `invoice-${this.invoiceFormData.invoiceDetails.invoiceNumber}`;

    this.paymentService.generatePdf(html, fileName).subscribe({
      next: (blob) => {
        this.loader = false;
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url, '_blank');
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

  sendInvoice() {
    this.spinner = true;
    if (this.sendInvoiceForm.invalid) {
      this.spinner = false;
      this.snackBar.open('Please fill all the fields', 'close', {
        duration: 5000,
        panelClass: ['warning-snackbar', 'snackbar-with-progress'],
        verticalPosition: 'top',
        horizontalPosition: 'end',
      });
      return;
    }
    const payload = {
      email: this.sendInvoiceForm.get('email').value,
      invoice: this.pdfFile,
    };
    this.paymentService.sendInvoieEmail(payload).subscribe({
      next: (res: SendInvoiceEmailResponse) => {
        this.spinner = false;
        this.snackBar.open(res.message, 'close', {
          duration: 5000,
          panelClass: ['success-snackbar', 'snackbar-with-progress'],
          verticalPosition: 'top',
          horizontalPosition: 'end',
        });
        this.CloseBtn.nativeElement.click();
        window.location.reload();
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
}
