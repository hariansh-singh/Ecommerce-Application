import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-all-order-details',
  imports: [CommonModule],
  templateUrl: './all-order-details.component.html',
  styleUrl: './all-order-details.component.css'
})
export class AllOrderDetailsComponent {
  orders: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('https://localhost:7125/api/Order').subscribe(response => {
      console.log("data", response);
      this.orders = response.data;
    });
  }
}
