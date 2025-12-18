import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataHandlingService } from '../../services/dataHanling.service';

@Component({
  selector: 'app-preview-invoice-data',
  standalone: true,
  templateUrl: './preview.html',
  styleUrls: ['./preview.scss'],
  imports: [CommonModule],
})
export class Preview {
  invoiceFormData: any;

  //dependancies
  private dataService = inject(DataHandlingService);

  ngOnInit(): void {
    this.getInvoiceData()
  }

  getInvoiceData() {
    this.dataService.formData.subscribe({
      next: (res: any) => {
        
      },
      error: (err: any) => {
        console.error("")
      }
    })
  }
}
