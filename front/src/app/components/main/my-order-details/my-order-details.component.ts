import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Fetch email from route parameters
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-my-order-details',
  imports: [CommonModule],
  templateUrl: './my-order-details.component.html',
  styleUrls: ['./my-order-details.component.css']
})
export class MyOrderDetailsComponent implements OnInit {
  orders: any[] = [];
  id: any = '';

  authService: any = inject(AuthService)
  
  userData: any = this.authService.decodedTokenData()
  name: any = this.userData['Name']

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || "";
    this.fetchUserOrders(this.id)
  }

  // Fetch orders by user ID with error handling
  fetchUserOrders(id: any) {
    this.orderService.fetchOrdersById(id).subscribe({
      next: (response) => {
        console.log('Fetched orders:', response);
        if (response.data && response.data.length > 0) {
          this.orders = response.data;
        } else {
          console.warn('No orders found for this user');
        }
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
      }
    });
  }
}