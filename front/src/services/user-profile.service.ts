import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiBaseUrl = 'https://localhost:7116/api';

  constructor(private http: HttpClient) {}

  updateCustomerInfo(customerId: number, customerData: any): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/Customer/${customerId}`, customerData);
  }

  // Fetch customer information
  getCustomerInfo(customerId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/Customer/${customerId}`);
  }

  // Fetch user addresses
  getUserAddresses(customerId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/user-address/${customerId}`);
  }

  // Add a new user address
  addUserAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/user-address/add`, addressData);
  }

  // Update an existing user address
  updateUserAddress(addressId: number, addressData: any): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/user-address/update/${addressId}`, addressData);
  }

  // Remove a user address
  removeUserAddress(addressId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/user-address/remove/${addressId}`);
  }

  // Fetch customer orders
  getCustomerOrders(customerId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/Order/byUser/${customerId}`);
  }

  // Fetch user reviews
  getUserReviews(customerId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/user-reviews/customer/${customerId}`);
  }

  // Add a new user review
  addUserReview(reviewData: any): Observable<any> {
    return this.http.post(`${this.apiBaseUrl}/user-reviews/add`, reviewData);
  }
}
