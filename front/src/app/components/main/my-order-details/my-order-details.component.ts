import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // To fetch email from route parameters

@Component({
  selector: 'app-my-order-details',
  imports: [CommonModule],
  templateUrl: './my-order-details.component.html',
  styleUrls: ['./my-order-details.component.css']
})
export class MyOrderDetailsComponent implements OnInit {
  orders: any[] = [];
  email: string = ''; // Store user email

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    // Fetch the email from the route parameters
    this.route.params.subscribe(params => {
      this.email = params['email'];
      this.fetchOrdersByEmail(this.email);
    });
  }

  // Fetch orders by user email
  fetchOrdersByEmail(email: string) {
    this.http.get<any>(`https://localhost:7125/api/Order/byUser/${email}`).subscribe(
      response => {
        console.log("Orders retrieved:", response);
        this.orders = response.data; // Populate orders array
      },
      error => {
        console.error("Error retrieving orders:", error);
      }
    );
  }
}