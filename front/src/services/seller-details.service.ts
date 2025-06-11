import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SellerDetailsService {
  private API_URL = 'https://localhost:7116';

  constructor(private http: HttpClient) {}

  getAllSellerDetails() {
    return this.http.get(`${this.API_URL}/api/seller_details`);
  }

  getSellerDetailsById(sellerId: number) {
    return this.http.get(`${this.API_URL}/api/seller_details/${sellerId}`);
  }

  updateSellerDetails(sellerId: number, data: any) {
    return this.http.put(
      `${this.API_URL}/api/seller_details/${sellerId}`,
      data
    );
  }

  deleteSellerDetails(sellerId: number) {
    return this.http.delete(`${this.API_URL}/api/seller_details/${sellerId}`);
  }

  addSellerDetails(data: any) {
    return this.http.post(`${this.API_URL}/api/seller_details`, data);
  }
}
