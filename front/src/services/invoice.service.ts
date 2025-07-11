import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

  async generateInvoicePdf(
    order: any,
    userName: string,
    userEmail: string
  ): Promise<Blob> {
    const doc = new jsPDF();

    // Logo (async load)
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.src = 'logo.png'; // Place your logo in assets folder!
      img.onload = () => {
        doc.addImage(img, 'PNG', 160, 10, 40, 20);
        resolve();
      };
      img.onerror = () => resolve();
    });

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255);
    doc.text('INVOICE', 10, 30);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let yPosition = 40;
    doc.text(`Order ID: ${order.orderId}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Customer ID: ${order.customerId}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Customer Name: ${userName}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Customer Email: ${userEmail}`, 10, yPosition);
    yPosition += 10;
    doc.text(
      `Order Date: ${new Date(order.orderDate).toLocaleDateString()}`,
      10,
      yPosition
    );
    yPosition += 10;
    doc.text(`Shipping Address: ${order.shippingAddress}`, 10, yPosition);
    yPosition += 10;

    doc.setDrawColor(0, 0, 0);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Order Items', 10, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('No.', 10, yPosition);
    doc.text('Product', 30, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Price', 150, yPosition);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    order.orderItems.forEach((item: any, index: number) => {
      doc.text(`${index + 1}`, 10, yPosition);
      doc.text(
        `${item.products?.productName || 'Unknown Product'}`,
        30,
        yPosition
      );
      doc.text(`${item.quantity}`, 120, yPosition);
      doc.text(`₹${item.products?.productPrice || 0}`, 150, yPosition);
      yPosition += 10;
    });

    yPosition += 20;
    doc.text(`Total Price: ₹ ${order.totalPrice}`, 10, yPosition);
    yPosition += 20;

    doc.setFontSize(12);
    doc.text('Authorized Signature:', 10, yPosition);
    doc.line(60, yPosition, 120, yPosition);
    yPosition += 20;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your purchase!', 10, yPosition);

    return doc.output('blob');
  }

  async uploadInvoice(
    order: any,
    userName: string,
    userEmail: string
  ): Promise<any> {
    const pdfBlob = await this.generateInvoicePdf(order, userName, userEmail);

    const formData = new FormData();
    formData.append('orderId', order.orderId.toString());
    formData.append('customerEmail', userEmail);
    formData.append('customerName', userName);
    formData.append('invoice', pdfBlob, `invoice_${order.orderId}.pdf`);

    // Replace with your backend endpoint
    return this.http
      .post<any>('https://localhost:7116/api/Order/upload-invoice', formData)
      .toPromise();
  }

  async downloadInvoice(
    order: any,
    userName: string,
    userEmail: string
  ): Promise<void> {
    const pdfBlob = await this.generateInvoicePdf(order, userName, userEmail);
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_Order_${order.orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  }
}
