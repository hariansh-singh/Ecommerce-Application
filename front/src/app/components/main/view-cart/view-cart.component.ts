import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../services/order.service';

@Component({
  selector: 'app-view-cart',
  imports: [CommonModule],
  templateUrl: './view-cart.component.html',
  styleUrl: './view-cart.component.css',
})
export class ViewCartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  cartService = inject(CartService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  decodedToken: any = this.authService.decodedTokenData();

  constructor() {}

  ngOnInit(): void {
    this.cartService.getCartItems(this.decodedToken.CustomerId).subscribe({
      next: (response: any) => {
        console.log('Raw API Response:', response);

        if (Array.isArray(response)) {
          this.cartItems = response.map((item) => ({
            ...item,
            cartId: item.cartId || null, // ✅ Ensure `cartId` exists
          }));
        } else {
          console.error('Unexpected API response structure:', response);
          this.cartItems = [];
        }

        this.calculateTotalPrice();
      },
      error: (error) => console.error('API Error fetching cart:', error),
    });
  }

  placeOrder(): void {
    if (!this.cartItems.length) {
      alert('Your cart is empty!');
      return;
    }

    const orderData = {
      customerId: this.decodedToken.CustomerId, // ✅ Send correct customer ID
      orderDate: new Date().toISOString(), // ✅ Format order date correctly
      totalPrice: this.totalPrice, // ✅ Include total price calculation
      shippingAddress: 'Your shipping address here', // 🔹 Replace with actual input
      orderItems: this.cartItems.map((item) => ({
        orderId: 0, // 🔹 Backend will generate actual orderId
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.orderService.placeNewOrder(orderData).subscribe({
      next: () => {
        console.log('Order placed successfully!', orderData);
        alert('Order has been placed!');
        this.cartItems = []; // ✅ Clear cart after placing order
        this.totalPrice = 0;
      },
      error: (error) => console.error('Error placing order:', error),
    });
  }

  increaseQuantity(item: any): void {
    if (item.quantity < item.products.stockQuantity) {
      item.quantity++;
      this.updateCartItem(item);
    }
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateCartItem(item);
    }
  }

  updateCartItem(cartItem: any): void {
    if (!cartItem.cartId || !this.decodedToken.CustomerId) {
      console.error('Invalid cart item update request:', cartItem);
      alert('Error: Unable to update item. Cart ID or Customer ID is missing.');
      return;
    }

    const updatedItem = {
      customerId: this.decodedToken.CustomerId, // ✅ Ensure correct customer ID is passed
      productId: cartItem.productId,
      quantity: cartItem.quantity,
    };

    this.cartService.updateCartItem(cartItem.cartId, updatedItem).subscribe({
      next: () => {
        console.log('Cart item updated successfully:', cartItem.cartId);
        this.calculateTotalPrice();
      },
      error: (error) => console.error('Error updating cart item:', error),
    });
  }

  removeFromCart(cartItem: any): void {
    console.log('Trying to remove cart item:', cartItem);

    if (!cartItem.cartId) {
      console.error('Cart ID is missing:', cartItem);
      alert('Error: Unable to remove item. Cart ID is missing.');
      return;
    }

    this.cartService.removeFromCart(cartItem.cartId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item.cartId !== cartItem.cartId
        );
        this.calculateTotalPrice();
        console.log('Item removed successfully:', cartItem.cartId);
      },
      error: (error) => console.error('Error removing item:', error),
    });
  }

  calculateTotalPrice(): void {
    if (!Array.isArray(this.cartItems)) {
      this.cartItems = [];
    }
    this.totalPrice = this.cartItems.reduce(
      (sum, item) =>
        sum + (item.products.productPrice || 0) * (item.quantity || 0),
      0
    );
  }
}
