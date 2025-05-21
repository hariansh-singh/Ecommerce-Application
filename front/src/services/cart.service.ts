import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';

export interface CartItem {
  cartId: number;
  customerId: number;
  productId: number;
  quantity: number;
  products: {
    productId: number;
    productName: string;
    productPrice: number;
    stockQuantity: number;
    imageUrl?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7116/api/Cart'; // Using the hardcoded URL from the previous version
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  private totalPriceSubject = new BehaviorSubject<number>(0);

  // Exposed as observables
  cartItems$ = this.cartItemsSubject.asObservable();
  cartItemCount$ = this.cartItemCountSubject.asObservable();
  totalPrice$ = this.totalPriceSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetches all cart items for a user
   * @param userId The customer ID
   * @returns Observable of cart items array
   */
  getCartItems(userId: number): Observable<CartItem[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`).pipe(
      map(response => {
        // Handle different API response formats
        const items = Array.isArray(response) ? response : 
                      (response?.data && Array.isArray(response.data)) ? response.data : [];
        
        // Update the behavior subjects
        this.cartItemsSubject.next(items);
        this.updateCartData(items);
        
        return items;
      }),
      catchError(error => {
        console.error('Error fetching cart items:', error);
        return of([]);
      })
    );
  }

  /**
   * Adds a product to cart
   * @param product Product object with customerId, productId, and quantity
   * @returns Observable of the API response
   */
  addToCart(product: any): Observable<any> {
    console.log(`Sending POST request to: ${this.apiUrl}`, product);
    return this.http.post<any>(this.apiUrl, product).pipe(
      tap(() => {
        // Refresh cart data after adding an item
        if (product.customerId) {
          this.getCartItems(product.customerId).subscribe();
        }
      })
    );
  }

  /**
   * Updates an item in the cart
   * @param cartId Cart item ID
   * @param updatedItem Updated item data
   * @returns Observable of the API response
   */
  updateCartItem(cartId: number, updatedItem: any): Observable<any> {
    console.log(`Sending PUT request to: ${this.apiUrl}/${cartId}`, updatedItem);
    return this.http.put(`${this.apiUrl}/${cartId}`, updatedItem).pipe(
      tap(() => {
        // Update local cart data
        const currentItems = this.cartItemsSubject.value;
        const updatedItems = currentItems.map(item => {
          if (item.cartId === cartId) {
            return { ...item, quantity: updatedItem.quantity };
          }
          return item;
        });
        
        this.cartItemsSubject.next(updatedItems);
        this.updateCartData(updatedItems);
      })
    );
  }

  /**
   * Removes an item from the cart
   * @param cartId Cart item ID to remove
   * @returns Observable of the API response
   */
  removeFromCart(cartId: number): Observable<any> {
    console.log(`Sending DELETE request to: ${this.apiUrl}/${cartId}`);
    return this.http.delete(`${this.apiUrl}/${cartId}`).pipe(
      tap(() => {
        // Update local cart data
        const currentItems = this.cartItemsSubject.value;
        const updatedItems = currentItems.filter(item => item.cartId !== cartId);
        
        this.cartItemsSubject.next(updatedItems);
        this.updateCartData(updatedItems);
      })
    );
  }

  /**
   * Clears all items from a user's cart
   * @param userId Customer ID
   * @returns Observable of the API response
   */
  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${userId}`).pipe(
      tap(() => {
        // Clear local cart data
        this.cartItemsSubject.next([]);
        this.cartItemCountSubject.next(0);
        this.totalPriceSubject.next(0);
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        
        // Fallback to individual item deletion if clear endpoint doesn't exist
        const currentItems = this.cartItemsSubject.value;
        if (currentItems.length > 0) {
          // Create an array of observables for each delete operation
          const deleteObservables = currentItems.map(item => 
            this.removeFromCart(item.cartId)
          );
          
          // Use Promise.all to execute all delete operations
          Promise.all(deleteObservables).then(() => {
            this.cartItemsSubject.next([]);
            this.cartItemCountSubject.next(0);
            this.totalPriceSubject.next(0);
          });
        }
        
        return of([]);
      })
    );
  }

  /**
   * Updates the cart data in the behavior subjects
   * @param items Current cart items
   */
  private updateCartData(items: CartItem[]): void {
    if (!Array.isArray(items)) {
      items = [];
    }
    
    const totalItems = items.reduce((count, item) => count + (item.quantity || 0), 0);
    const totalPrice = items.reduce((sum, item) => {
      const price = item.products?.productPrice || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    this.cartItemCountSubject.next(totalItems);
    this.totalPriceSubject.next(totalPrice);
  }

  /**
   * Gets the current cart item count
   * @returns Number of items in cart
   */
  getCurrentCartCount(): number {
    return this.cartItemCountSubject.value;
  }

  /**
   * Gets the current cart total price
   * @returns Total price of items in cart
   */
  getCurrentTotalPrice(): number {
    return this.totalPriceSubject.value;
  }
}