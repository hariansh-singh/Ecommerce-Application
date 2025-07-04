
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiResponse, ProductSalesInfo, SellerDashboardService } from '../../../../services/seller-dashboard.service';
import { AuthService } from '../../../../services/auth.service';
import { OrderService } from '../../../../services/order.service';

// Import the interfaces from the service

// UI interface for displaying products
interface SoldProduct {
  productId: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  revenue: number;
  orderCount: number;
  thumbnail: string;
  deliveryStatus: string; // e.g. "Pending", "Shipped", "Delivered"
  status: string;          // e.g. "Active", "Canceled"
  orderId: number;         // required for cancellation
}

@Component({
  selector: 'app-sales',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit, OnDestroy {
  // Use the updated service name
  private sellerDashboardService = inject(SellerDashboardService);
    private orderService = inject(OrderService);
  
  // Summary data
  totalItemsSold = 0;
  totalRevenue = 0;
  totalOrdersCount = 0;
  bestSeller: SoldProduct | null = null;
  soldProducts: SoldProduct[] = [];
  
  // Search and filtering
  searchTerm = '';
  filteredProducts: SoldProduct[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Modal
  selectedProduct: SoldProduct | null = null;
  
  // UI states
  isLoading = false;
  errorMessage: string | null = null;
  
  // Subscription management
  private subscription: Subscription = new Subscription();
  
  authService: any = inject(AuthService)
  userData: any = this.authService.decodedTokenData()
  private readonly sellerId = this.userData?.CustomerId || 0;

  ngOnInit(): void {
    this.loadSalesData();
    console.log('User Data:', this.userData);
    console.log('Seller ID:', this.sellerId);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSalesData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Updated service call
    const salesSubscription = this.sellerDashboardService.getSalesInfo(this.sellerId)
      .subscribe({
        next: (response: ApiResponse) => {
          console.log('API Response:', response);
          this.processSalesData(response);
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('API Error:', error);
          this.errorMessage = error.message;
          this.isLoading = false;
          this.resetData();
        }
      });

    this.subscription.add(salesSubscription);
  }
private processSalesData(apiResponse: ApiResponse): void {
  console.log('Processing API Response:', apiResponse);

  if (!apiResponse || apiResponse.err !== 0 || !apiResponse.data) {
    console.error('API Response error or invalid structure');
    this.errorMessage = apiResponse?.msg || 'Invalid response from server';
    return;
  }

  const data = apiResponse.data;

  if (!data.productSales || !Array.isArray(data.productSales)) {
    console.error('Product sales data is missing or invalid');
    this.errorMessage = 'Product sales data is not available';
    return;
  }

  this.totalItemsSold = data.totalProductsSold || 0;
  this.totalRevenue = data.totalRevenue || 0;
  this.totalOrdersCount = data.totalOrdersCount || 0;

  this.soldProducts = data.productSales.map((product: ProductSalesInfo, index: number) => {
    try {
      const firstOrder = product.orderDetails?.[0];

      return {
        productId: product.productId || index + 1,
        orderId: firstOrder?.orderId || 0,
        name: product.productName || 'Unknown Product',
        category: product.productCategory || 'Unknown Category',
        price: product.productPrice || 0,
        quantity: product.totalQuantitySold || 0,
        revenue: product.totalRevenue || 0,
        orderCount: product.orderDetails?.length || 0,
        deliveryStatus: firstOrder?.orderStatus || 'Pending',
        status: firstOrder?.orderStatus || 'Active',
        thumbnail: this.getProductThumbnail(product.productName || 'Unknown', product.productCategory || 'Unknown')
      };
    } catch (error) {
      console.error('Error processing product:', product, error);
      return {
        productId: index + 1,
        orderId: 0,
        name: 'Error Processing Product',
        category: 'Unknown',
        price: 0,
        quantity: 0,
        revenue: 0,
        orderCount: 0,
        deliveryStatus: 'Pending',
        status: 'Unknown',
        thumbnail: this.getDefaultThumbnail()
      };
    }
  });

  this.bestSeller = this.soldProducts.reduce((max, product) =>
    product.quantity > (max?.quantity ?? 0) ? product : max,
    null as SoldProduct | null
  );

  this.filteredProducts = [...this.soldProducts];
  this.updatePagination();
}

  // Search functionality
  onSearchChange(): void {
    this.filteredProducts = this.soldProducts.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProducts = [...this.soldProducts];
    this.updatePagination();
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Product details modal
  viewProductDetails(product: SoldProduct): void {
    this.selectedProduct = product;
  }

  closeProductDetails(): void {
    this.selectedProduct = null;
  }

  // Utility methods
  trackByProductId(index: number, product: SoldProduct): number {
    return product.productId;
  }

  onImageError(event: any): void {
    const img = event.target;
    
    // Prevent infinite loop
    if (img.dataset.fallbackApplied) {
      return;
    }
    
    img.dataset.fallbackApplied = 'true';
    img.src = this.getDefaultThumbnail();
  }

  getTopCategory(): string {
    if (this.soldProducts.length === 0) return 'N/A';
    
    const categoryCount = this.soldProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + product.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getProductThumbnail(productName: string, category: string): string {
    // Create category-based emoji placeholders
    const categoryImageMap: Record<string, string> = {
      'laptops': '💻',
      'mobiles': '📱',
      'gaming': '🎮',
      'monitors': '🖥️',
      'electronics': '⚡'
    };
    
    const categoryEmoji = categoryImageMap[category.toLowerCase()] || '📦';
    
    return `data:image/svg+xml;charset=UTF-8,%3csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='64' height='64' fill='%23f8fafc' stroke='%23e2e8f0' stroke-width='1'/%3e%3ctext x='32' y='40' font-size='24' text-anchor='middle'%3e${categoryEmoji}%3c/text%3e%3c/svg%3e`;
  }

  private getDefaultThumbnail(): string {
    return `data:image/svg+xml;charset=UTF-8,%3csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='64' height='64' fill='%23F3F4F6'/%3e%3cpath d='M21.3333 21.3333H28.6667V28.6667H21.3333V21.3333Z' fill='%239CA3AF'/%3e%3cpath d='M19 42.6667L45 16L28 33.3333L19 42.6667Z' fill='%239CA3AF'/%3e%3c/svg%3e`;
  }

  private resetData(): void {
    this.totalItemsSold = 0;
    this.totalRevenue = 0;
    this.totalOrdersCount = 0;
    this.bestSeller = null;
    this.soldProducts = [];
    this.filteredProducts = [];
  }

  // Utility methods for template
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
updateDeliveryStatus(product: SoldProduct): void {
  if (product.status === 'Canceled') {
    this.triggerNotification(`🚫 Cannot update status for a canceled order.`);
    return;
  }

  this.orderService.updateOrderStatus(product.orderId, product.deliveryStatus).subscribe({
    next: res => {
      product.status = product.deliveryStatus;
      this.triggerNotification(`📦 Updated to '${product.deliveryStatus}'`);

      // Optional: once shipped, disallow cancel by syncing status
      if (product.deliveryStatus === 'Shipped') {
        product.status = 'Shipped';
      }
    },
    error: err => {
      console.error('Status update failed:', err);
      this.triggerNotification(`❌ Failed to update status`);
    }
  });
}




cancelOrder(orderId: number): void {
  const item = this.soldProducts.find(p => p.orderId === orderId);
  if (!item) return;

  if (item.status !== 'Pending') {
    this.triggerNotification(`⚠️ Only 'Pending' orders can be canceled.`);
    return;
  }

  const confirmCancel = confirm(`Cancel Order #${orderId}?`);
  if (!confirmCancel) return;

  this.orderService.cancelOrderById(orderId).subscribe({
    next: () => {
      item.status = 'Canceled';
      item.deliveryStatus = 'Canceled';
      this.triggerNotification(`❌ Order #${orderId} canceled`);
    },
    error: () => this.triggerNotification(`⚠️ Could not cancel order`)
  });
}




notificationMessage = '';
showNotification = false;

triggerNotification(message: string): void {
  this.notificationMessage = message;
  this.showNotification = true;
  setTimeout(() => this.showNotification = false, 3000);
}

  // Public methods for template
  refreshData(): void {
    this.loadSalesData();
  }

  clearError(): void {
    this.errorMessage = null;
  }

  // Getter for template to check if we have data
  get hasData(): boolean {
    return this.soldProducts.length > 0;
  }


  get isEmpty(): boolean {
    return !this.isLoading && !this.errorMessage && this.soldProducts.length === 0;
  }
}