import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
private apiUrl = 'https://localhost:7116/api/Payment';

  constructor(private http: HttpClient) { }
   storeCardDetails(data: any) {
    return this.http.post(`${this.apiUrl}/store`, data);
  }
   getSavedCards(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getByCustomer/${customerId}`);
  }
}
