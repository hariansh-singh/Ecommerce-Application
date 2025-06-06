import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  customerId = 1; // Replace with dynamic customer ID
  user: any = {};
  addresses: any[] = [];
  orders: any[] = [];
  reviews: any[] = [];

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    this.loadCustomerInfo();
    this.loadUserAddresses();
    this.loadCustomerOrders();
    this.loadUserReviews();
  }

  loadCustomerInfo(): void {
    this.userProfileService.getCustomerInfo(this.customerId).subscribe(
      data => {
        this.user = data;
      },
      error => {
        console.error('Error fetching customer info', error);
      }
    );
  }

  loadUserAddresses(): void {
    this.userProfileService.getUserAddresses(this.customerId).subscribe(
      data => {
        this.addresses = data;
      },
      error => {
        console.error('Error fetching addresses', error);
      }
    );
  }

  loadCustomerOrders(): void {
    this.userProfileService.getCustomerOrders(this.customerId).subscribe(
      data => {
        this.orders = data;
      },
      error => {
        console.error('Error fetching orders', error);
      }
    );
  }

  loadUserReviews(): void {
    this.userProfileService.getUserReviews(this.customerId).subscribe(
      data => {
        this.reviews = data;
      },
      error => {
        console.error('Error fetching reviews', error);
      }
    );
  }

  contactSupport(): void {
    console.log('User is contacting support...');
  }
}
