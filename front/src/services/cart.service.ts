import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7116/api/Cart'; // 🔹 API base URL
  private cartItems: any[] = [];
  private cartItemCount = new BehaviorSubject<number>(0);
  private totalPrice = new BehaviorSubject<number>(0);

  // Expose the cart item count and total price as observables
  cartItemCount$ = this.cartItemCount.asObservable();
  totalPrice$ = this.totalPrice.asObservable();

  constructor(private http: HttpClient) {} // 🔹 Inject HttpClient for API calls

  // 🔹 Fetch all cart items from the API
  getCartItems(userId: number) {
    return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      map(response => Array.isArray(response.data) ? response.data : []) // ✅ Ensure an array is returned
    );
  }

  // 🔹 Add product to cart via API
  addToCart(product: any) {
    return this.http.post(this.apiUrl, product); // ✅ Returns observable, no .subscribe() here
  }

  // 🔹 Update product quantity in cart
  updateCartItem(cartId: number, updatedItem: any) {
  console.log(`Sending PUT request to: ${this.apiUrl}/${cartId}`, updatedItem);
  return this.http.put(`${this.apiUrl}/${cartId}`, updatedItem);
}

  // 🔹 Remove an item from the cart
 removeFromCart(cartId: number) {
  console.log(`Sending DELETE request to: ${this.apiUrl}/${cartId}`);
  return this.http.delete(`${this.apiUrl}/${cartId}`);
}

  // 🔹 Calculate cart item count & total price
  private updateCartData(): void {
    if (!Array.isArray(this.cartItems)) {
      this.cartItems = []; // ✅ Ensure cartItems is an array before calling reduce
    }

    const totalItems = this.cartItems.reduce((count, item) => count + item.quantity, 0);
    const totalPrice = this.cartItems.reduce((sum, item) => sum + (item.productPrice || 0) * item.quantity, 0);

    this.cartItemCount.next(totalItems);
    this.totalPrice.next(totalPrice);
  }
}