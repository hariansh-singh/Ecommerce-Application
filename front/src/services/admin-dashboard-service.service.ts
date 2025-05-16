import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardServiceService {

  private apiUrl = 'https://localhost:7116/api/admin'; 
 
  constructor(private http: HttpClient) {}
 
  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-users`);
  }
 
  getSellersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/sellers-count`);
  }
 
  getNewOrders(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/new-orders`);
  }
 
  getSalesData(period: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sales?period=${period}`);
  }
 
  getTopSellingProducts(period: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top-products?period=${period}`);
  }
}
