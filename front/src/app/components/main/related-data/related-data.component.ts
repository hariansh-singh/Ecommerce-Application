import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';

interface Product {
  productId: string;
  productName: string;
  productPrice: number;
  originalPrice?: number;
  productImagePath: string;
  onSale?: boolean;
  rating?: number;
  reviewCount?: number;
  selectedQuantity?: number;
  stockQuantity?: number;
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
  authService = inject(AuthService);
  decodedToken: any = this.authService.decodedTokenData();

  constructor(
    private productService: ProductService, 
    private router: Router,
    private cdr: ChangeDetectorRef
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
          this.products = data.data || [];
          this.processProductData();
        },
        error: () => {
          this.products = [];
        }
      });
  }

  private processProductData(): void {
    this.products = this.products.map(product => ({
      ...product,
      rating: product.rating ?? 4.5,
      reviewCount: product.reviewCount ?? 25,
      selectedQuantity: product.selectedQuantity ?? 1,
      stockQuantity: product.stockQuantity ?? 10
    }));
  }

  increaseQuantity(product: Product): void {
    if (product.selectedQuantity! < product.stockQuantity!) {
      product.selectedQuantity!++;
      this.cdr.markForCheck();
    }
  }

  decreaseQuantity(product: Product): void {
    if (product.selectedQuantity! > 1) {
      product.selectedQuantity!--;
      this.cdr.markForCheck();
    }
  }

  addToCart(product: Product): void {
    if (!product.selectedQuantity || product.selectedQuantity <= 0 || product.selectedQuantity > (product.stockQuantity ?? 10)) {
      Swal.fire({
        title: 'Warning!',
        text: 'Invalid quantity selected!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.decodedToken?.CustomerId) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to your cart',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    const cartItem = {
      customerId: this.decodedToken.CustomerId,
      productId: product.productId,
      quantity: product.selectedQuantity
    };

    this.isAddingToCart = true;

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        Swal.fire({
          title: 'Success!',
          text: `${product.productName} added to cart!`,
          icon: 'success',
          confirmButtonText: 'Continue Shopping',
          timer: 2000,
          timerProgressBar: true
        });
        this.animateCartIcon();
        this.isAddingToCart = false;
      },
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add product to cart. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        this.isAddingToCart = false;
      }
    });
  }

  onCardHover(event: Event, isHovering: boolean): void {
    const card = event.currentTarget as HTMLElement;
    card.style.transform = isHovering ? 'translateY(-8px)' : 'translateY(0)';
    card.style.boxShadow = isHovering ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '0 8px 25px rgba(0, 0, 0, 0.1)';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-product.jpg';
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  animateCartIcon(): void {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('cart-animation');
      setTimeout(() => {
        cartIcon.classList.remove('cart-animation');
      }, 600);
    }
  }
}
