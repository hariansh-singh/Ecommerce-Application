import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private API_URL = 'https://localhost:7116';

  constructor(private http: HttpClient) {}

  public searchQuery$ = new BehaviorSubject<string>(''); // Ensure it's a BehaviorSubject

  setSearchQuery(query: string): void {
    this.searchQuery$.next(query); // Update the value
  }

  getSearchQuery(): string {
    return this.searchQuery$.getValue(); // Retrieve the latest value
  }

  getAllProducts() {
    return this.http.get(`${this.API_URL}/api/Product`);
  }

  getSellerProducts(sellerId: number) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
    return this.http.get(`${this.API_URL}/api/Product/myproducts/${sellerId}`, { headers });
  }

  addProduct(data: any) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || sessionStorage.getItem("token")}`
    );
    return this.http.post(`${this.API_URL}/api/Product`, data, { headers });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/api/Product/${id}`);
  }

  editProduct(id: number, data: any): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || sessionStorage.getItem("token")}`
    );
    return this.http.put(`${this.API_URL}/api/Product/${id}`, data, {
      headers,
    });
  }

  deleteProduct(id: number) {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token') || sessionStorage.getItem("token")}`
    );
    return this.http.delete(`${this.API_URL}/api/Product/${id}`, { headers });
  }
}
