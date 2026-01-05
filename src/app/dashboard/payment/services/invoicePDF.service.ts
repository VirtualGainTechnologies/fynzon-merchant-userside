import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataHandlingService } from './dataHanling.service';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  // private invoiceData = inject(DataHandlingService);
  async generatePdf(invoiceData: any, fileName: string) {
    // 1️⃣ Create hidden container
    const container = document.createElement('div');
    container.style.visibility = 'hidden';
    container.style.position = 'absolute';
    container.innerHTML = this.getInvoiceHtml(invoiceData);
    document.body.appendChild(container);

    // 2️⃣ Render canvas and PDF
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);

    // 3️⃣ Remove temporary container
    document.body.removeChild(container);
  }

  private getInvoiceHtml(data: any): string {
    let rows = data.items
      .map(
        (item: any) =>
          `<tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
      </tr>`
      )
      .join('');

    return `
      <div style="font-family: Arial; width: 800px; padding: 20px;">
        <h2>Invoice</h2>
        <p>Invoice No: ${data.invoiceNo}</p>
        <p>Date: ${data.date}</p>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
          ${rows}
        </table>
      </div>
    `;
  }
}
