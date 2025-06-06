import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '../../../../services/auth.service';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  products? : any; 
}

interface Order {
  orderId: string;
  orderDate: string;
  totalPrice: number;
  orderStatus: 'Delivered' | 'Preparing' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  orderItems: OrderItem[];
  showItems?: boolean;
}

@Component({
  selector: 'app-my-order-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-order-details.component.html',
  styleUrls: ['./my-order-details.component.css']
})
export class MyOrderDetailsComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  id: string = '';
  name: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute, 
    private orderService: OrderService
  ) {
    this.initializeUserData();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.fetchUserOrders(this.id);
    }
  }

  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeUserData(): void {
    try {
      const userData: any = this.authService.decodedTokenData();
      this.name = userData['Name'] || 'User';
    } catch (error) {
      console.error('Error decoding user data:', error);
      this.name = 'User';
    }
  }

  private fetchUserOrders(userId: string): void {
  this.isLoading = true;
  this.error = null;

  this.orderService.fetchOrdersById(userId)
    .pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false))
    .subscribe({
      next: (response) => {
        console.log('Fetched orders:', response);
        if (response?.data && Array.isArray(response.data)) {
          // 🔹 Added showItems property for dropdown functionality
          this.orders = response.data.map((order: any) => ({
            ...order,
            showItems: false  // Default state: items hidden
          }));
        } else {
          this.orders = [];
        }
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.orders = [];
      }
    });
}

  trackByOrderId(index: number, order: Order): string {
    return order.orderId;
  }

  trackByItemId(index: number, item: OrderItem): string {
    return `${item.productId}-${index}`;
  }
}