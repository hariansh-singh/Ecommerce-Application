import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  placeNewOrder(orderDetails: any) {
    return this.http.post(`${this.API_URL}/api/Order`, orderDetails);
  }

  fetchOrdersById(id: any) {
    return this.http.get<any>(`${this.API_URL}/api/Order/byUser/${id}`);
  }

  submitProductReview(reviewData: UserReviewModel): Observable<any> {
    console.log('Sending review to API:', reviewData);
    return this.http.post(`${this.API_URL}/api/reviews`, reviewData)
      .pipe(
        catchError((error) => {
          console.error('API review submission failed:', error);
          return throwError(() => new Error('Error submitting review.'));
        })
      );
  }

  cancelOrderById(orderId: string | number): Observable<any> {
    return this.http.patch(`${this.API_URL}/api/Order/cancel/${orderId}`, {});
  }


}