import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home-seller',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-seller.component.html',
  styleUrl: './home-seller.component.css'
})
export class HomeSellerComponent implements OnInit {
  products: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  filteredProducts: any[] = [];
  sortBy: string = 'productName';
  selectedStockFilter: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' = 'all';  //added
  sortOrder: 'asc' | 'desc' = 'asc';

  authService = inject(AuthService);
  productService = inject(ProductService);

  userData:any = this.authService.decodedTokenData()
  sellerId:number = this.userData['CustomerId']

  ngOnInit(): void {
     window.scrollTo(0, 0); // Ensures the page opens from the top
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getSellerProducts(this.sellerId)
      .subscribe({
        next: (data: any) => {
          console.log("API Response:", data);
          this.products = data.data || [];
          this.filteredProducts = [...this.products];
          this.loading = false;
        },
        error: (error) => {
          console.error("API Error:", error);
          this.loading = false;
        }
      });
  }

deleteProduct(id: number): void {
  Swal.fire({
    title: 'Are you sure?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((product: any) => product.productId !== id);
          this.filteredProducts = this.filteredProducts.filter((product: any) => product.productId !== id);

          Swal.fire(
            'Deleted!',
            'The product has been deleted.',
            'success'
          );
        },
        error: (error) => {
          console.error("Error deleting product:", error);
          Swal.fire(
            'Error!',
            'Something went wrong while deleting the product.',
            'error'
          );
        }
      });
    }
  });
}


  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterProducts();
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product =>
      product.productName.toLowerCase().includes(this.searchTerm) ||
      product.description.toLowerCase().includes(this.searchTerm) ||
      product.productId.toString().includes(this.searchTerm)
    );
  }

  //added
  filterByStockStatus(status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'): void {
  this.selectedStockFilter = status;

  switch (status) {
    case 'in-stock':
      this.filteredProducts = this.products.filter(p => p.stockQuantity > 10);
      break;
    case 'low-stock':
      this.filteredProducts = this.products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10);
      break;
    case 'out-of-stock':
      this.filteredProducts = this.products.filter(p => p.stockQuantity === 0);
      break;
    default:
      this.filteredProducts = [...this.products];
      break;
  }
  // Also reapply search filter, if any
  if (this.searchTerm.trim()) {
    this.filteredProducts = this.filteredProducts.filter(product =>
      product.productName.toLowerCase().includes(this.searchTerm) ||
      product.description.toLowerCase().includes(this.searchTerm) ||
      product.productId.toString().includes(this.searchTerm)
    );
  }
}

  sortProducts(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }

    this.filteredProducts.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      if (column === 'productPrice') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusText(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  }

  // Getter methods for stats
  get totalProducts(): number {
    return this.products.length;
  }

  get inStockCount(): number {
    return this.products.filter(p => p.stockQuantity > 10).length;
  }

  get lowStockCount(): number {
    return this.products.filter(p => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => p.stockQuantity === 0).length;
  }

  trackByProductId(index: number, product: any): number {
    return product.productId;
  }
}