import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private API_URL = "https://localhost:7125"

  constructor(private http:HttpClient) { }

  placeNewOrder(orderDetails:any) {
    return this.http.post(`${this.API_URL}/api/Order`, orderDetails)
  }
}
