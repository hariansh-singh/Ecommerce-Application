import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserAddress {
  addressId: number;
  customerId: number;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {
  private baseUrl = 'https://localhost:7116/api/user-address';  // Updated API base URL

  constructor(private http: HttpClient) {}

  getAddresses(customerId: number): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(`${this.baseUrl}/${customerId}`);
  }

  addAddress(address: UserAddress): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/add`, address);
  }

  removeAddress(addressId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/remove/${addressId}`);
  }

  updateAddress(addressId: number, address: UserAddress): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/update/${addressId}`, address);
  }
  getDefaultAddress(customerId: number): Observable<UserAddress> {
  return this.http.get<UserAddress>(`${this.baseUrl}/default/${customerId}`);
}

}
