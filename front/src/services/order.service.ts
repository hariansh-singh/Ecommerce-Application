import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface UserReviewModel {
  customerId: number;
  productId: number;
  rating: number;
  reviewText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private API_URL = 'https://localhost:7116';

  constructor(private http: HttpClient) {}

  placeNewOrder(orderDetails: any) {
    return this.http.post(`${this.API_URL}/api/Order`, orderDetails);
  }

  fetchOrdersById(id: any) {
    return this.http.get<any>(`${this.API_URL}/api/Order/byUser/${id}`);
  }

  // Add this method to submit product reviews
  submitProductReview(reviewData: UserReviewModel): Observable<any> {
    return this.http.post(`${this.API_URL}/api/Review`, reviewData);
  }
}