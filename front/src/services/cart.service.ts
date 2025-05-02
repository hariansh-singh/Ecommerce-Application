import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  private cartItems: any[] = []; 

  private cartItemCount = new BehaviorSubject<number>(0); // Observable for the cart item count
  private totalPrice = new BehaviorSubject<number>(0); // Observable for the total cart price

  // Expose the cart item count and total price as observables
  cartItemCount$ = this.cartItemCount.asObservable();
  totalPrice$ = this.totalPrice.asObservable();

  // Fetch all cart items
  getCartItems() {
    return this.cartItems;
  }

  // Add product to the cart
  addToCart(product: any): void {
    const existingItem = this.cartItems.find(item => item.productId === product.productId);
    if (existingItem) {
      existingItem.quantity += 1; // Increment quantity if the product already exists in the cart
    } else {
      this.cartItems.push({
        productId: product.productId,
        productName: product.productName,
        productPrice: product.productPrice,
        productCategory: product.productCategory,
        productFeatures: product.productFeatures,
        quantity: 1 // Default quantity when adding for the first time
      });
    }
    this.updateCartData(); // Recalculate totals and item count
  }

  // Remove a specific item from the cart
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.updateCartData(); // Recalculate totals and item count
  }

  // Clear all items from the cart
  clearCart(): void {
    this.cartItems = [];
    this.updateCartData(); // Reset totals and item count
  }

  // Recalculate cart item count and total price
  private updateCartData(): void {
    const totalItems = this.cartItems.reduce((count, item) => count + item.quantity, 0);
    const totalPrice = this.cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

    // Update the BehaviorSubjects with new values
    this.cartItemCount.next(totalItems);
    this.totalPrice.next(totalPrice);
  }
}