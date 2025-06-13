import { Component, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../../services/order.service';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-cart',
  standalone: true, 
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.css'],
  animations: [
  trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('cartItemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms 300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('removeButtonAnimation', [
      state('idle', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.1)' })),
      transition('idle <=> hover', animate('150ms ease-in-out'))
    ])
  ]
})
export class ViewCartComponent implements OnInit {
  @ViewChild('checkoutSection') checkoutSection!: ElementRef;
  
  cartItems: any[] = [];
  totalPrice: number = 0;
  isProcessing: boolean = false;
  promoCode: string = '';
  promoApplied: boolean = false;
  discount: number = 0;
  
  // Updated shipping address object with detailed fields
  shippingAddress = {
    customerId: 0,
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India', // Default to India, can be changed by user
    postalCode: '',
    isDefault: false
  };
  
  selectedPayment: string = 'card';
  
  paymentDetails = {
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: ''
  };
  
  cartService = inject(CartService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  
  decodedToken: any = this.authService.decodedTokenData();
  
  constructor() {}
  
  ngOnInit(): void {
    window.scrollTo(0, 0); // Scrolls to the top of the page
    this.shippingAddress.customerId = this.decodedToken.CustomerId;
    this.loadCartItems();
  }
  
  // SweetAlert2 Toast Utility Methods
  showSuccessToast(message: string, title: string = 'Success'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  showErrorToast(message: string, title: string = 'Error'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  showWarningToast(message: string, title: string = 'Warning'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  showInfoToast(message: string, title: string = 'Info'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  loadCartItems(): void {
    this.cartService.getCartItems(this.decodedToken.CustomerId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.cartItems = response.map((item) => ({
            ...item,
            cartId: item.cartId || null,
            isHighlighted: false,
            // Ensure the product has a valid image URL or use a fallback
            products: {
              ...item.products,
              imageUrl: item.products.imageUrl || 'https://via.placeholder.com/150' // Using an online placeholder
            }
          }));
          
          // Add staggered animation effect
          this.cartItems.forEach((item, index) => {
            setTimeout(() => {
              item.isVisible = true;
            }, 100 * index);
          });
        } else {
          console.error('Unexpected API response structure:', response);
          this.cartItems = [];
        }
        
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('API Error fetching cart:', error);
        this.showErrorToast('Failed to load your cart items');
      }
    });
  }
  
  placeOrder(): void {
    if (!this.cartItems.length) {
      this.showWarningToast('Your cart is empty!');
      return;
    }
    
    if (!this.validatePaymentDetails()) {
      return;
    }
    
    if (!this.validateShippingAddress()) {
      return;
    }
    
    this.isProcessing = true;
    
    const orderData = {
      customerId: this.decodedToken.CustomerId,
      orderDate: new Date().toISOString(),
      totalPrice: this.getFinalTotal(),
      shippingAddress: this.getFormattedAddress(),
      paymentMethod: this.selectedPayment,
      addressDetails: this.shippingAddress, // Send detailed address object
      orderItems: this.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.products.productPrice
      }))
    };
    
    this.orderService.placeNewOrder(orderData)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: () => {
          this.showSuccessToast('Your order has been placed successfully!', 'Order Placed');
          this.cartItems = [];
          this.totalPrice = 0;
          this.promoApplied = false;
          this.discount = 0;
          this.resetShippingAddress();
          
          // Clear cart data in service
          this.cartService.clearCart(this.decodedToken.CustomerId).subscribe();
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.showErrorToast('Failed to place your order. Please try again.');
        }
      });
  }
  
  validatePaymentDetails(): boolean {
    if (this.selectedPayment === 'card') {
      if (!this.paymentDetails.cardholderName || 
          !this.paymentDetails.cardNumber || 
          !this.paymentDetails.expiryDate || 
          !this.paymentDetails.cvv) {
        this.showWarningToast('Please complete all payment fields');
        return false;
      }
      
      // Basic validation for card number format
      if (this.paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        this.showWarningToast('Please enter a valid 16-digit card number');
        return false;
      }
    }
    
    if (this.selectedPayment === 'upi' && !this.paymentDetails.upiId) {
      this.showWarningToast('Please enter your UPI ID');
      return false;
    }
    
    return true;
  }
  
  validateShippingAddress(): boolean {
    const requiredFields = [
      { field: 'addressLine1', name: 'Address Line 1' },
      { field: 'city', name: 'City' },
      { field: 'state', name: 'State' },
      { field: 'country', name: 'Country' },
      { field: 'postalCode', name: 'Postal Code' }
    ];
    
    for (const { field, name } of requiredFields) {
      if (!this.shippingAddress[field as keyof typeof this.shippingAddress] || 
          (this.shippingAddress[field as keyof typeof this.shippingAddress] as string).trim() === '') {
        this.showWarningToast(`Please enter ${name}`);
        return false;
      }
    }
    
    // Validate postal code length (max 10 characters)
    if (this.shippingAddress.postalCode.length > 10) {
      this.showWarningToast('Postal code cannot exceed 10 characters');
      return false;
    }
    
    // Basic postal code format validation for India
    if (this.shippingAddress.country.toLowerCase() === 'india') {
      const indianPinRegex = /^[1-9][0-9]{5}$/;
      if (!indianPinRegex.test(this.shippingAddress.postalCode)) {
        this.showWarningToast('Please enter a valid 6-digit PIN code for India');
        return false;
      }
    }
    
    return true;
  }
  
  getFormattedAddress(): string {
    const parts = [
      this.shippingAddress.addressLine1,
      this.shippingAddress.addressLine2,
      this.shippingAddress.landmark,
      this.shippingAddress.city,
      this.shippingAddress.state,
      this.shippingAddress.country,
      this.shippingAddress.postalCode
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }
  
  resetShippingAddress(): void {
    this.shippingAddress = {
      customerId: this.decodedToken.CustomerId,
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      isDefault: false
    };
  }
  
  increaseQuantity(item: any): void {
    if (item.quantity < item.products.stockQuantity) {
      item.quantity++;
      item.isHighlighted = true;
      this.updateCartItem(item);
      
      // Remove highlight after 1 second
      setTimeout(() => {
        item.isHighlighted = false;
      }, 1000);
    } else {
      this.showInfoToast('Maximum available quantity reached');
    }
  }
  
  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.isHighlighted = true;
      this.updateCartItem(item);
      
      // Remove highlight after 1 second
      setTimeout(() => {
        item.isHighlighted = false;
      }, 1000);
    }
  }
  
  updateCartItem(cartItem: any): void {
    if (!cartItem.cartId || !this.decodedToken.CustomerId) {
      console.error('Invalid cart item update request:', cartItem);
      this.showErrorToast('Unable to update item. Missing information.');
      return;
    }
    
    const updatedItem = {
      customerId: this.decodedToken.CustomerId,
      productId: cartItem.productId,
      quantity: cartItem.quantity
    };
    
    this.cartService.updateCartItem(cartItem.cartId, updatedItem).subscribe({
      next: () => {
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('Error updating cart item:', error);
        this.showErrorToast('Failed to update item quantity');
        // Revert quantity on error
        cartItem.quantity = cartItem.previousQuantity || 1;
      }
    });
  }
  
  removeFromCart(cartItem: any): void {
    if (!cartItem.cartId) {
      console.error('Cart ID is missing:', cartItem);
      this.showErrorToast('Unable to remove item. Cart ID is missing.');
      return;
    }
    
    this.cartService.removeFromCart(cartItem.cartId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item.cartId !== cartItem.cartId
        );
        this.calculateTotalPrice();
        this.showSuccessToast('Item removed from cart');
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.showErrorToast('Failed to remove item from cart');
      }
    });
  }
  
  calculateTotalPrice(): void {
    if (!Array.isArray(this.cartItems)) {
      this.cartItems = [];
    }
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.products.productPrice || 0) * (item.quantity || 0),
      0
    );
  }
  
  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  
  getDiscount(): number {
    return this.promoApplied ? this.discount : 0;
  }
  
  getShippingCost(): number {
    // Free shipping for orders over INR 1000
    return this.totalPrice > 1000 ? 0 : 99;
  }
  
  getFinalTotal(): number {
    return this.totalPrice - this.getDiscount() + this.getShippingCost();
  }
  
  applyPromoCode(): void {
    // Simple promo code logic
    if (this.promoCode.toUpperCase() === 'WELCOME10') {
      this.discount = this.totalPrice * 0.10; // 10% discount
      this.promoApplied = true;
      this.showSuccessToast('Promo code applied successfully!');
    } else if (this.promoCode.toUpperCase() === 'FLAT500') {
      this.discount = 500;
      this.promoApplied = true;
      this.showSuccessToast('Promo code applied successfully!');
    } else {
      this.promoApplied = false;
      this.discount = 0;
      this.showErrorToast('Invalid promo code');
    }
  }
  
  selectPayment(method: string): void {
    this.selectedPayment = method;
  }
  
  formatCardNumber(): void {
    // Remove non-digits
    let value = this.paymentDetails.cardNumber.replace(/\D/g, '');
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
    // Add spaces every 4 digits
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    
    this.paymentDetails.cardNumber = parts.join(' ');
  }
  
  formatExpiryDate(): void {
    // Remove non-digits
    let value = this.paymentDetails.expiryDate.replace(/\D/g, '');
    
    // Format as MM/YY
    if (value.length > 0) {
      const month = value.substring(0, 2);
      const year = value.substring(2, 4);
      
      if (value.length > 2) {
        this.paymentDetails.expiryDate = `${month}/${year}`;
      } else {
        this.paymentDetails.expiryDate = month;
      }
    }
  }
  
  scrollToCheckout(): void {
    if (this.checkoutSection) {
      this.checkoutSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Utility method to format postal code (remove spaces and convert to uppercase)
  formatPostalCode(): void {
    this.shippingAddress.postalCode = this.shippingAddress.postalCode
      .replace(/\s+/g, '')
      .toUpperCase()
      .substring(0, 10); // Limit to 10 characters
  }
  
  // Method to auto-fill state based on postal code (for India)
  onPostalCodeChange(): void {
    if (this.shippingAddress.country.toLowerCase() === 'india' && 
        this.shippingAddress.postalCode.length === 6) {
      // This is a basic implementation - in a real app, you'd use a postal code API
      const firstDigit = this.shippingAddress.postalCode.charAt(0);
      const stateMap: { [key: string]: string } = {
        '1': 'Delhi',
        '2': 'Haryana',
        '3': 'Punjab',
        '4': 'Rajasthan',
        '5': 'Uttar Pradesh',
        '6': 'Bihar',
        '7': 'West Bengal',
        '8': 'Odisha',
        '9': 'Tamil Nadu'
      };
      
      if (stateMap[firstDigit] && !this.shippingAddress.state) {
        this.shippingAddress.state = stateMap[firstDigit];
      }
    }
  }
}