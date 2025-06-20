import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../services/cart.service';
import { inject } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger,
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { UserProfileService } from '../../../../services/user-profile.service';

@Component({
  selector: 'app-productdetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productdetails.component.html',
  styleUrls: ['./productdetails.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '0.8s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate(
          '1s 0.2s ease-out',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
    ]),
    trigger('titleSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate(
          '0.8s 0.4s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('priceSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '0.8s 0.6s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('descriptionSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.8s 0.8s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('stockSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '0.8s 1s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('quantitySlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate(
          '0.8s 1.1s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('buttonSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '0.8s 1.2s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('buttonHover', [
      state('normal', style({ transform: 'scale(1)' })),
      state('hovered', style({ transform: 'scale(1.1)' })),
      transition('normal <=> hovered', animate('0.2s ease')),
    ]),
    trigger('imageFloat', [
      transition(':enter', [
        animate(
          '3s ease-in-out',
          keyframes([
            style({ transform: 'translateY(0px) scale(1)', offset: 0 }),
            style({ transform: 'translateY(-10px) scale(1.02)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100px)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.5s ease-out',
          style({ opacity: 0, transform: 'translateX(100px)' })
        ),
      ]),
    ]),
  ],
})
export class ProductdetailsComponent implements OnInit, OnDestroy {
  products: any = null;
  quantity: number = 1;
  showSuccessAnimation: boolean = false;
  showSuccessNotification: boolean = false;
  buttonText: string = 'Add to Cart';
  isLoading: boolean = true;
  reviews: any[] = [];

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  currentUser: any = this.authService.decodedTokenData();
  customerId: any = this.currentUser['CustomerId'];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productIdStr: any = this.route.snapshot.paramMap.get('id');
    this.loadProduct();
    this.userProfileService
      .getProductReviews(productIdStr)
      .subscribe((data) => {
        this.reviews = data.data;
        console.log('Product Reviews:', this.reviews);
      });

    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(): void {
    const productIdStr = this.route.snapshot.paramMap.get('id');

    if (!productIdStr || isNaN(Number(productIdStr))) {
      console.error('Invalid Product ID:', productIdStr);
      this.router.navigate(['/products']).then(() => window.scrollTo(0, 0));
      return;
    }

    const productId = Number(productIdStr);
    console.log('Retrieved Product ID:', productId);

    this.productService
      .getProductById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Full API Response:', response);

          if (response && response.data) {
            this.products = response.data;
            this.isLoading = false;
            console.log('Assigned Product Object:', this.products);
          } else {
            console.error(
              "API response does not contain expected 'data' property:",
              response
            );
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          console.error('Error fetching product:', err);
          this.isLoading = false;
        },
      });
  }

  increaseQuantity(): void {
    if (this.quantity < this.products?.stockQuantity) {
      this.quantity++;
      this.animateQuantityChange('increase');
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.animateQuantityChange('decrease');
    }
  }

  private animateQuantityChange(type: 'increase' | 'decrease'): void {
    const input = document.querySelector('.quantity-input') as HTMLElement;
    if (input) {
      const scale = type === 'increase' ? 'scale(1.1)' : 'scale(0.9)';
      input.style.transform = scale;
      setTimeout(() => {
        input.style.transform = 'scale(1)';
      }, 200);
    }
  }

  addToCart(): void {
    if (!this.products || !this.products.productId) {
      console.error('Invalid product object:', this.products);
      return;
    }

    // Prepare cart item with quantity
    const cartItem = {
      customerId: this.customerId,
      productId: this.products.productId,
      quantity: this.quantity,
    };

    // Add to cart through service - MUST subscribe to execute the HTTP request
    this.cartService
      .addToCart(cartItem)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Trigger success animations only after successful API call
          this.triggerSuccessAnimations();
          window.scrollTo(0, 0);
        },
        error: (error) => {
          console.error('Error adding product to cart:', error);
        },
      });
  }

  private triggerSuccessAnimations(): void {
    // Button animation
    this.showSuccessAnimation = true;
    this.buttonText = 'Added to Cart!';

    // Success notification
    this.showSuccessNotification = true;

    // Reset after animations
    setTimeout(() => {
      this.showSuccessAnimation = false;
      this.buttonText = 'Add to Cart';
    }, 1000);

    setTimeout(() => {
      this.showSuccessNotification = false;
    }, 1000);
  }

  // Method to handle image load errors
  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    // Set a fallback image or handle the error appropriately
    event.target.src = 'assets/images/product-placeholder.jpg';
  }

  // Method to format price with currency
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  }

  // Method to check if product is in stock
  isInStock(): boolean {
    return this.products?.stockQuantity > 0;
  }

  // Method to get stock status class
  getStockStatusClass(): string {
    if (!this.products) return '';

    if (this.products.stockQuantity === 0) {
      return 'out-of-stock';
    } else if (this.products.stockQuantity <= 10) {
      return 'low-stock';
    }
    return 'in-stock';
  }

  // Method to navigate back to products
  goBack(): void {
    this.router.navigate(['/products']).then(() => window.scrollTo(0, 0));
  }

  // Track by function for performance optimization
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  averageRating(): number {
    if (!this.reviews.length) return 0;
    const total = this.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return parseFloat((total / this.reviews.length).toFixed(1));
  }
}
