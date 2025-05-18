import { Component, OnInit } from '@angular/core';
import { AdminDashboardServiceService } from '../../../../services/admin-dashboard-service.service';
import { MatCardModule } from '@angular/material/card';
import { SalesChartComponent } from '../sales-chart/sales-chart.component';
import { TopProductsChartComponent } from '../top-products-chart/top-products-chart.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule, MatCardModule, SalesChartComponent, TopProductsChartComponent],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css'
})
export class HomeAdminComponent implements OnInit {

  totalUsers!: number;
  sellersCount!: number;
  newOrders!: number;
  salesData: any = { labels: [], values: [] }; // ✅ Ensuring Default Structure
  topSellingProducts: any = { labels: [], values: [] }; // ✅ Prevents Undefined Errors

  constructor(private dashboardService: AdminDashboardServiceService) {}

  ngOnInit(): void {
  this.dashboardService.getTotalUsers().subscribe((response: any) => {
    this.totalUsers = response?.data ?? 0;
  });

  this.dashboardService.getSellersCount().subscribe((response: any) => {
    this.sellersCount = response?.data ?? 0;
  });

  this.dashboardService.getNewOrders().subscribe((response: any) => {
    this.newOrders = response?.data ?? 0;
  });

  this.dashboardService.getSalesData('monthly').subscribe((response: any) => {
    console.log("✅ Sales Data Response:", response);

    // Ensure response.data is correctly structured
    if (typeof response.data === 'number') {
      this.salesData = { labels: ["Monthly Sales"], values: [response.data] };
    } else {
      this.salesData = response?.data && response?.data.labels && response?.data.values
        ? { labels: response.data.labels, values: response.data.values }
        : { labels: [], values: [] };
    }
  });

  this.dashboardService.getTopSellingProducts('monthly').subscribe((response: any) => {
    console.log("✅ Top Products Response:", response);

    // Ensure response.data exists and correctly map the structure
    if (Array.isArray(response?.data)) {
      this.topSellingProducts = {
        labels: response.data.map((item:any) => item.productId?.toString() || "Unknown"), // Convert productId to string
        values: response.data.map((item:any) => item.totalSold ?? 0) // Ensure totalSold exists
      };
    } else {
      this.topSellingProducts = { labels: [], values: [] };
    }
  });
}
}