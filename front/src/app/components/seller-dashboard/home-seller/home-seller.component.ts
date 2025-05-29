import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ProductService } from '../../../../services/product.service';
import { CommonModule } from '@angular/common';

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
  sortOrder: 'asc' | 'desc' = 'asc';

  productService = inject(ProductService);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts()
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
    if (confirm("Are you sure you want to delete this product?")) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter((product: any) => product.productId !== id);
          this.filteredProducts = this.filteredProducts.filter((product: any) => product.productId !== id);
          console.log(`Product with ID ${id} deleted`);
        },
        error: (error) => {
          console.error("Error deleting product:", error);
        }
      });
    }
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