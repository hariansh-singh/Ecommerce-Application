import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user: any = {};
  addresses: any[] = [];
  orders: any[] = [];
  reviews: any[] = [];
  filteredOrders: any[] = [];

  name: any = '';
  email: string = '';
  phoneNumber: string = '';
  role: string = '';

  authService: any = inject(AuthService);
  userData: any = this.authService.decodedTokenData();
  customerId = this.userData?.CustomerId || 0;

  activeSection: string = 'basic';
  isEditMode: boolean = false;
  orderFilter: string = 'all';

  navigationItems = [
    {
      key: 'basic',
      label: 'Basic Information',
      icon: 'fa-user-circle',
      count: null,
    },
    {
      key: 'addresses',
      label: 'Shipping Addresses',
      icon: 'fa-map-marker-alt',
      count: 0,
    },
    {
      key: 'payments',
      label: 'Payment Methods',
      icon: 'fa-credit-card',
      count: 0,
    },
    { key: 'orders', label: 'Order History', icon: 'fa-receipt', count: 0 },
    { key: 'reviews', label: 'Reviews & Ratings', icon: 'fa-star', count: 0 },
    {
      key: 'support',
      label: 'Support & Help',
      icon: 'fa-life-ring',
      count: null,
    },
  ];

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.loadCustomerInfo();
    this.loadUserAddresses();
    this.loadCustomerOrders();
    this.loadUserReviews();
  }

  loadCustomerInfo(): void {
    this.userProfileService.getCustomerInfo(this.customerId).subscribe(
      (data) => {
        this.user = data;
        this.name = this.user.data.name;
        this.email = this.user.data.email;
        this.phoneNumber = this.user.data.phoneNumber;
        this.role = this.user.data.role;
      },
      (error) => {
        console.error('Error fetching customer info', error);
      }
    );
  }

  loadUserAddresses(): void {
    this.userProfileService.getUserAddresses(this.customerId).subscribe(
      (data) => {
        this.addresses = data;
        this.updateNavigationCount('addresses', this.addresses.length);
      },
      (error) => {
        console.error('Error fetching addresses', error);
      }
    );
  }

  loadCustomerOrders(): void {
    this.userProfileService.getCustomerOrders(this.customerId).subscribe(
      (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.updateNavigationCount('orders', this.orders.length);
      },
      (error) => {
        console.error('Error fetching orders', error);
      }
    );
  }

  loadUserReviews(): void {
    this.userProfileService.getUserReviews(this.customerId).subscribe(
      (data) => {
        this.reviews = data;
        this.updateNavigationCount('reviews', this.reviews.length);
      },
      (error) => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  updateNavigationCount(section: string, count: number): void {
    const item = this.navigationItems.find((nav) => nav.key === section);
    if (item) {
      item.count = count;
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.isEditMode = false; // Reset edit mode when switching sections
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.saveBasicInfo();
    }
    this.isEditMode = !this.isEditMode;
  }

  saveBasicInfo(): void {
    const updatedInfo = {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
    };

    this.userProfileService
      .updateCustomerInfo(this.customerId, updatedInfo)
      .subscribe(
        (response) => {
          console.log('Profile updated successfully', response);
          // Show success message
        },
        (error) => {
          console.error('Error updating profile', error);
          // Show error message
        }
      );
  }

  getRoleBadgeClass(): string {
    const baseClass = 'badge-';
    switch (this.role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return `${baseClass}admin`;
      case 'moderator':
      case 'mod':
        return `${baseClass}moderator`;
      case 'user':
      case 'member':
        return `${baseClass}user`;
      case 'guest':
      default:
        return `${baseClass}guest`;
    }
  }

  getRoleIconClass(): string {
    switch (this.role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'fas fa-crown';
      case 'seller':
        return 'fas fa-store';
      case 'user':
      case 'buyer':
        return 'fas fa-shopping-cart';
      case 'guest':
      default:
        return 'fas fa-user-times';
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      delivered: 'success',
      pending: 'warning',
      cancelled: 'error',
      processing: 'info',
      shipped: 'info',
    };
    return statusClasses[status?.toLowerCase()] || 'default';
  }

  getCardIcon(cardType: string): string {
    const cardIcons: { [key: string]: string } = {
      visa: 'fa-cc-visa',
      mastercard: 'fa-cc-mastercard',
      amex: 'fa-cc-amex',
      discover: 'fa-cc-discover',
    };
    return cardIcons[cardType?.toLowerCase()] || 'fa-credit-card';
  }

  getAverageRating(): string {
    if (this.reviews.length === 0) return '0.0';
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / this.reviews.length).toFixed(1);
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  filterOrders(): void {
    if (this.orderFilter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        (order) =>
          order.orderStatus.toLowerCase() === this.orderFilter.toLowerCase()
      );
    }
  }

  // Action methods
  addNewAddress(): void {
    console.log('Adding new address...');
    // Implement add address logic
  }

  editAddress(index: number): void {
    console.log('Editing address at index:', index);
    // Implement edit address logic
  }

  deleteAddress(index: number): void {
    console.log('Deleting address at index:', index);
    // Implement delete address logic
  }

  addPaymentMethod(): void {
    console.log('Adding new payment method...');
    // Implement add payment method logic
  }

  editPaymentMethod(index: number): void {
    console.log('Editing payment method at index:', index);
    // Implement edit payment method logic
  }

  deletePaymentMethod(index: number): void {
    console.log('Deleting payment method at index:', index);
    // Implement delete payment method logic
  }

  viewOrderDetails(orderId: string): void {
    console.log('Viewing order details for:', orderId);
    // Navigate to order details page
  }

  reorder(orderId: string): void {
    console.log('Reordering:', orderId);
    // Implement reorder logic
  }

  startShopping(): void {
    console.log('Redirecting to shop...');
    // Navigate to shop page
  }

  editReview(reviewId: string): void {
    console.log('Editing review:', reviewId);
    // Implement edit review logic
  }

  deleteReview(reviewId: string): void {
    console.log('Deleting review:', reviewId);
    // Implement delete review logic
  }

  contactSupport(type: string): void {
    console.log('Contacting support via:', type);
    // Implement contact support logic based on type
  }

  openFAQ(): void {
    console.log('Opening FAQ...');
    // Navigate to FAQ page
  }
}
