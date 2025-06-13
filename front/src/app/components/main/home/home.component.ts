import { Component, inject, OnInit, AfterViewInit, ElementRef, ChangeDetectionStrategy, NgZone, ChangeDetectorRef } from '@angular/core';
import { BannerComponent } from '../banner/banner.component';
import { RelatedDataComponent } from '../related-data/related-data.component';
import { ProductService } from '../../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [BannerComponent, RelatedDataComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush // Use OnPush for better performance
})
export class HomeComponent implements OnInit, AfterViewInit {
  products: any[] = []; 
  isLoading: boolean = true;
  activeTestimonialIndex: number = 0;

  testimonials = [
    { comment: "The smartphone I bought exceeded all my expectations. Lightning-fast processing and amazing battery life!", author: "Sarah Johnson" },
    { comment: "Tech Haven has the best selection of laptops I've seen. Great prices and excellent customer support.", author: "Michael Chen" },
    { comment: "My new smartwatch from Tech Haven has transformed how I track my fitness. Love the sleek design!", author: "Emma Williams" }
  ];

  cartService = inject(CartService);
  authService = inject(AuthService);
  decodedToken: any = this.authService.decodedTokenData();

  constructor(
    private productService: ProductService, 
    private router: Router,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
     window.scrollTo(0, 0); // Scrolls to the top of the page
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Start testimonial carousel after component is initialized
    this.startTestimonialCarousel();
  }

  startTestimonialCarousel(): void {
    // Set the first testimonial as active
    setTimeout(() => {
      this.setActiveTestimonial(0);
      
      // Rotate testimonials every 5 seconds
      setInterval(() => {
        this.rotateTestimonials();
      }, 5000);
    }, 0);
  }

  setActiveTestimonial(index: number): void {
    this.ngZone.run(() => {
      // Remove active class from all testimonials
      const testimonials = this.elementRef.nativeElement.querySelectorAll('.testimonial');
      testimonials.forEach((testimonial: HTMLElement) => {
        testimonial.classList.remove('active');
      });
      
      // Add active class to the current testimonial
      if (testimonials[index]) {
        testimonials[index].classList.add('active');
        this.activeTestimonialIndex = index;
        this.cdr.markForCheck();
      }
    });
  }

  rotateTestimonials(): void {
    let nextIndex = this.activeTestimonialIndex + 1;
    if (nextIndex >= this.testimonials.length) {
      nextIndex = 0;
    }
    this.setActiveTestimonial(nextIndex);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        console.log('Products received:', response);
        if (response && response.data) {
          // Process all products with consistent structure
          this.products = response.data.map((product: any) => ({
            ...product,
            selectedQuantity: 1,
            stars: this.calculateStars(product.rating || 4.5)
          }));
          
          this.isLoading = false;
          this.cdr.markForCheck(); // Trigger change detection
        } else {
          this.handleError('Invalid response format');
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        this.handleError('Failed to load products');
      }
    });
  }

  // Handle errors consistently
  private handleError(message: string): void {
    this.isLoading = false;
    this.cdr.markForCheck();
    Swal.fire({
      title: 'Error!',
      text: `${message}. Please try again later.`,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }

  // TrackBy function to optimize ngFor rendering
  trackByProductId(index: number, product: any): number {
    return product.productId;
  }

  calculateStars(rating: number): number[] {
    const stars: number[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    return stars;
  }

  increaseQuantity(product: any): void {
    if (product.selectedQuantity < product.stockQuantity) {
      product.selectedQuantity++;
      this.cdr.markForCheck(); // Mark for check when data changes
    }
  }

  decreaseQuantity(product: any): void {
    if (product.selectedQuantity > 1) {
      product.selectedQuantity--;
      this.cdr.markForCheck(); // Mark for check when data changes
    }
  }

  addToCart(product: any): void {
    // Validate quantity
    if (!product.selectedQuantity || product.selectedQuantity <= 0 || product.selectedQuantity > product.stockQuantity) {
      Swal.fire({
        title: 'Warning!',
        text: 'Invalid quantity selected!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if user is logged in
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

    // Add loading state to button
    const button = document.querySelector(`.product-card[data-product-id="${product.productId}"] .btn-primary`) as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...';
    }

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: `${product.productName} added to cart!`,
          icon: 'success',
          confirmButtonText: 'Continue Shopping',
          timer: 2000,
          timerProgressBar: true
        });
        
        // Reset button state
        if (button) {
          button.disabled = false;
          button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Add to Cart';
        }
        
        // Animate cart icon
        this.animateCartIcon();
      },
      error: (error: any) => {
        console.error('Failed to add product to cart', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add product to cart. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        
        // Reset button state
        if (button) {
          button.disabled = false;
          button.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Add to Cart';
        }
      }
    });
  }

  // Optimized animation method
  animateCartIcon(): void {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('cart-animation');
      setTimeout(() => {
        cartIcon.classList.remove('cart-animation');
      }, 600);
    }
  }

  subscribeNewsletter(): void {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput && emailInput.value && this.isValidEmail(emailInput.value)) {
      Swal.fire({
        title: 'Subscribed!',
        text: 'Thank you for subscribing to our tech updates!',
        icon: 'success',
        confirmButtonText: 'Great!',
        timer: 2000,
        timerProgressBar: true
      });
      emailInput.value = '';
    } else {
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}