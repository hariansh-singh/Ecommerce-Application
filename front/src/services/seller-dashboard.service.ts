import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Updated interfaces to match your actual API response
export interface OrderDetailInfo {
  orderId: number;
  customerId: number;
  customerName: string;
  orderDate: string;
  orderStatus: string;
  quantityOrdered: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ProductSalesInfo {
  productId: number;
  productName: string;
  productCategory: string;
  productPrice: number;
  totalQuantitySold: number;
  totalRevenue: number;
  orderDetails: OrderDetailInfo[];
}

export interface ProductSalesData {
  productSales: ProductSalesInfo[];
  totalRevenue: number;
  totalOrdersCount: number;
  totalProductsSold: number;
}

export interface ApiResponse {
  err: number;
  msg: string;
  data: ProductSalesData;
}

@Injectable({
  providedIn: 'root'
})
export class SellerDashboardService {
  private readonly apiUrl = 'https://localhost:7116/api/salesinfo';

  constructor(private http: HttpClient) {}

  getSalesInfo(sellerId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${sellerId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while fetching sales data.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('Sales API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}