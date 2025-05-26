import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { Subject, takeUntil, finalize } from 'rxjs';

interface Product {
  productId: string;
  productName: string;
  productPrice: number;
  originalPrice?: number;
  productImagePath: string;
  onSale?: boolean;
  rating?: number;
  reviewCount?: number;
}

@Component({
  selector: 'app-related-data',
  imports: [RouterLink, CommonModule],
  templateUrl: './related-data.component.html',
  styleUrl: './related-data.component.css'
})
export class RelatedDataComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading: boolean = true;
  isAddingToCart: boolean = false;
  
  private destroy$ = new Subject<void>();
  private cartService = inject(CartService);

  constructor(
    private productService: ProductService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getAllProducts()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data: any) => {
          console.log("API Response:", data);
          this.products = data.data || [];
          this.processProductData();
        },
        error: (error: any) => {
          console.error("API Error:", error);
          this.products = [];
        }
      });
  }

  private processProductData(): void {
    // Only add missing data if needed, don't override existing data
    this.products = this.products.map(product => ({
      ...product,
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 25
    }));
  }

  private generateMockRating(): number {
    return Math.floor(Math.random() * 2) + 4; // 4-5 stars
  }

  private generateMockReviewCount(): number {
    return Math.floor(Math.random() * 100) + 10; // 10-110 reviews
  }

  addToCart(product: Product): void {
    if (this.isAddingToCart) return;
    
    this.isAddingToCart = true;
    
    // Add to cart immediately without delay
    this.cartService.addToCart(product);
    console.log('Product added to cart:', product);
    
    // Reset button state quickly
    setTimeout(() => {
      this.isAddingToCart = false;
    }, 300);
  }

  private showAddToCartSuccess(): void {
    // You can implement toast notification here
    console.log('Item added to cart successfully!');
  }

  onCardHover(event: Event, isHovering: boolean): void {
    const card = event.currentTarget as HTMLElement;
    if (isHovering) {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    } else {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-product.jpg'; // Fallback image
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  trackByProductId(index: number, product: Product): string {
    return product.productId;
  }
}