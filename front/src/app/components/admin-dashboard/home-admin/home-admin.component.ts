import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AdminDashboardServiceService } from '../../../../services/admin-dashboard-service.service';
import { MatCardModule } from '@angular/material/card';
import { SalesChartComponent } from '../sales-chart/sales-chart.component';
import { TopProductsChartComponent } from '../top-products-chart/top-products-chart.component';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule, MatCardModule, SalesChartComponent, TopProductsChartComponent],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition('void <=> *', animate('500ms ease-in-out')),
    ]),
    trigger('slideIn', [
      state('void', style({
        transform: 'translateX(-30px)',
        opacity: 0
      })),
      transition('void => *', [
        animate('600ms ease-out')
      ])
    ]),
    trigger('numberCount', [
      state('void', style({ opacity: 0 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('1000ms 300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeAdminComponent implements OnInit, AfterViewInit {
  totalUsers: number = 0;
  sellersCount: number = 0;
  newOrders: number = 0;
  salesData: any = { labels: [], values: [] }; 
  topSellingProducts: any = { labels: [], values: [] };
  
  // For animation purposes
  animatedTotalUsers: number = 0;
  animatedSellersCount: number = 0;
  animatedNewOrders: number = 0;
  
  loading: boolean = true;
  dataError: boolean = false;
  cardsLoaded: boolean = false;
  chartsLoaded: boolean = false;

  constructor(private dashboardService: AdminDashboardServiceService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  ngAfterViewInit(): void {
    // For better UX, simulate a slight delay in loading
    setTimeout(() => {
      this.cardsLoaded = true;
    }, 300);
  }

  fetchDashboardData(): void {
    // Display loading state
    this.loading = true;
    
    // Load users count with animation
    this.dashboardService.getTotalUsers().subscribe({
      next: (response: any) => {
        this.totalUsers = response?.data ?? 0;
        this.animateCounters('totalUsers', this.totalUsers);
      },
      error: (err) => {
        console.error('Error fetching users data', err);
        this.dataError = true;
        this.loading = false;
      }
    });

    // Load sellers count with animation
    this.dashboardService.getSellersCount().subscribe({
      next: (response: any) => {
        this.sellersCount = response?.data ?? 0;
        this.animateCounters('sellersCount', this.sellersCount);
      },
      error: (err) => {
        console.error('Error fetching sellers data', err);
        this.dataError = true;
        this.loading = false;
      }
    });

    // Load new orders with animation
    this.dashboardService.getNewOrders().subscribe({
      next: (response: any) => {
        this.newOrders = response?.data ?? 0;
        this.animateCounters('newOrders', this.newOrders);
      },
      error: (err) => {
        console.error('Error fetching orders data', err);
        this.dataError = true;
        this.loading = false;
      }
    });

    // Load sales data with proper error handling
    this.dashboardService.getSalesData('monthly').subscribe({
      next: (response: any) => {
        console.log("✅ Sales Data Response:", response);
        
        if (typeof response?.data === 'number') {
          this.salesData = { labels: ["Monthly Sales"], values: [response.data] };
        } else if (response?.data) {
          this.salesData = {
            labels: response.data.labels || [],
            values: response.data.values || []
          };
        } else {
          this.salesData = { labels: [], values: [] };
        }
        
        this.chartsLoaded = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching sales data', err);
        this.dataError = true;
        this.loading = false;
      }
    });

    // Load top selling products with proper error handling
    this.dashboardService.getTopSellingProducts('monthly').subscribe({
      next: (response: any) => {
        console.log("✅ Top Products Response:", response);
        
        if (Array.isArray(response?.data)) {
          // Format data for better display
          this.topSellingProducts = {
            labels: response.data.map((item: any) => {
              // Try to get product name if available, fallback to ID
              return item.productName || `Product ${item.productId}` || "Unknown";
            }),
            values: response.data.map((item: any) => item.totalSold ?? 0)
          };
        } else {
          this.topSellingProducts = { labels: [], values: [] };
        }
        
        this.chartsLoaded = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching top products data', err);
        this.dataError = true;
        this.loading = false;
      }
    });
  }

  // Counter animation for better UX
  animateCounters(property: string, targetValue: number): void {
    const duration = 1500; // animation duration in ms
    const frameDuration = 16; // duration of one frame (approximately 60fps)
    const totalFrames = Math.round(duration / frameDuration);
    const valueIncrement = targetValue / totalFrames;
    
    let currentFrame = 0;
    
    const animate = () => {
      currentFrame++;
      
      if (property === 'totalUsers') {
        this.animatedTotalUsers = Math.min(Math.round(valueIncrement * currentFrame), targetValue);
      } else if (property === 'sellersCount') {
        this.animatedSellersCount = Math.min(Math.round(valueIncrement * currentFrame), targetValue);
      } else if (property === 'newOrders') {
        this.animatedNewOrders = Math.min(Math.round(valueIncrement * currentFrame), targetValue);
      }
      
      if (currentFrame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Refresh dashboard data
  refreshData(): void {
    this.fetchDashboardData();
  }
}