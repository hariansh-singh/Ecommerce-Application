import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-cart',
  imports: [CommonModule],
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.css']
})
export class ViewCartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  router = inject(Router)

  constructor(private cartService: CartService, private orderService: OrderService) {}

  ngOnInit(): void {
    // Fetch cart items from CartService
    this.cartItems = this.cartService.getCartItems();
    console.log('Cart Items:', this.cartItems); // Debug the fetched items
    this.calculateTotalPrice(); // Calculate the total price of items in the cart
  }

  calculateTotalPrice(): void {
    // Calculate the total price based on item quantity and price
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );
  }

  placeOrder(): void {
    const orderPayload = {
      userEmail: 'hari@gmail.com',
      orderDate: new Date(), 
      totalAmount: this.totalPrice, 
      paymentMethod: 'Credit Card', 
      cardNumber: '1234567812345678', 
      shippingAddress: '123, Example Street, City, Country',
      orderItems: this.cartItems.map(item => ({
      productId: item.productId, 
      quantity: item.quantity,
      unitPrice: item.productPrice
      }))
    };
  
    // Call the API using OrderService
    this.orderService.placeNewOrder(orderPayload)
      .subscribe({
        next: (response) => {
          console.log('Order placed successfully:', response);
          alert('Order placed successfully!');
          this.cartService.clearCart(); // Clear the cart after order placement
          this.router.navigate(['/']); // Redirect to home or another page
        },
        error: (error) => {
          console.error('Error placing order:', error);
          alert('Failed to place order. Please try again!');
        }
      });
  }


}