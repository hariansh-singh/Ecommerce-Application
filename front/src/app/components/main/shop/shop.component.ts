import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductService } from '../../../../services/product.service';
import { CartService } from '../../../../services/cart.service';
import { RouterLink } from '@angular/router';

// Mock SweetAlert2 for artifact environment
const Swal = {
  fire: (options: any) => {
    console.log('SweetAlert:', options.title || options.text);
  }
};

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      transition('* => *', [
        style({ transform: 'scale(1)' }),
        animate('0.3s ease-in-out', style({ transform: 'scale(1.05)' })),
        animate('0.3s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ShopComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  
  // Filters
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortOption: string = 'default';
  
  // Categories (will be dynamically populated)
  categories: string[] = [];

  // Cart - using in-memory storage instead of localStorage
  cart: {productId: number, quantity: number, product: any}[] = [];
  
  // Mock customer ID for demo purposes
  private customerId: number = 1;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        // Handle different API response formats
        if (Array.isArray(response)) {
          this.products = response;
        } else if (response && typeof response === 'object') {
          // Check various possible structures
          if (Array.isArray(response.data)) {
            this.products = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            this.products = response.data.data;
          } else if (response.data && typeof response.data === 'object') {
            // If data is an object with product properties
            this.products = Object.values(response.data);
          } else {
            console.error('Unexpected API response structure:', response);
            this.products = [];
            this.error = 'Invalid data format received';
          }
        } else {
          console.error('Unexpected API response type:', response);
          this.products = [];
          this.error = 'Invalid data format received';
        }

        // Ensure products have required properties
        this.products = this.products.map(product => ({
          ...product,
          id: product.id || product.productId,
          name: product.name || product.productName || 'Unnamed Product',
          price: product.price || product.productPrice || 0,
          category: product.category || 'Uncategorized',
          description: product.description || '',
          productImagePath: product.productImagePath || product.imageUrl || ''
        }));

        // Only proceed with category extraction if products is an array
        if (Array.isArray(this.products)) {
          this.extractCategories();
          this.applyFilters();
        } else {
          console.error('Products is not an array after processing:', this.products);
          this.products = [];
          this.categories = [];
          this.filteredProducts = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Could not load products',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  loadCart(): void {
    // Load cart from CartService
    this.cartService.getCartItems(this.customerId).subscribe({
      next: (cartItems) => {
        this.cart = cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: item.products.productId,
            name: item.products.productName,
            price: item.products.productPrice,
            productImagePath: item.products.imageUrl
          }
        }));
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        // Keep empty cart if loading fails
        this.cart = [];
      }
    });
  }

  extractCategories(): void {
    // First ensure products is an array
    if (!Array.isArray(this.products)) {
      console.error('Products is not an array in extractCategories:', this.products);
      this.categories = [];
      return;
    }
    
    // Extract unique categories from products
    const uniqueCategories = new Set<string>();
    
    this.products.forEach(product => {
      // Check if product is an object and has a category property
      if (product && typeof product === 'object' && product.category) {
        uniqueCategories.add(product.category);
      }
    });
    
    this.categories = Array.from(uniqueCategories);
    
    // If no categories found, you might want to add some defaults
    if (this.categories.length === 0) {
      console.log('No categories found in products data');
    }
  }

  applyFilters(): void {
    // First ensure products is an array
    if (!Array.isArray(this.products)) {
      console.error('Products is not an array in applyFilters:', this.products);
      this.filteredProducts = [];
      this.totalPages = 0;
      return;
    }
    
    // Apply search, category and sorting filters
    let filtered = [...this.products];
    
    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(term) || 
        product.description?.toLowerCase().includes(term)
      );
    }
    
    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === this.selectedCategory
      );
    }
    
    // Sorting
    switch(this.sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
    }
    
    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    
    // Reset to first page when filters change
    this.currentPage = 1;
  }

  getImageUrl(product: any): string {
    if (product && product.productImagePath) {
      return 'https://localhost:7116/' + product.productImagePath;
    }
    // Return a default image URL or generate a colored placeholder with product name
    return `https://via.placeholder.com/300x200/cccccc/333333?text=${encodeURIComponent(product.name || 'Product')}`;
  }

  get pagedProducts(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of page
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  addToCart(product: any, quantity: number = 1): void {
    const cartPayload = {
      customerId: this.customerId,
      productId: product.id,
      quantity: quantity
    };

    this.cartService.addToCart(cartPayload).subscribe({
      next: (response) => {
        // Update local cart
        const existingItem = this.cart.find(item => item.productId === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.cart.push({
            productId: product.id,
            quantity: quantity,
            product: product
          });
        }
        
        // Show toast notification
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `${product.name} added to cart`,
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to add item to cart',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  updateQuantity(product: any, quantity: any): void {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) return;
    
    const existingItem = this.cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Find the cart item ID from the service or use a mock update
      const cartUpdatePayload = {
        customerId: this.customerId,
        productId: product.id,
        quantity: numQuantity
      };

      // For now, update locally and sync with service later
      existingItem.quantity = numQuantity;
      
      // You would call cartService.updateCartItem here with proper cartId
      console.log('Updating cart quantity:', cartUpdatePayload);
    }
  }

  isInCart(productId: number): boolean {
    return this.cart.some(item => item.productId === productId);
  }

  getCartQuantity(productId: number): number {
    const item = this.cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  getTotalItems(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Static rating methods since database doesn't have rating fields
  getProductRating(product: any): number {
    // Return a static rating between 3.5 and 5.0 based on product name/id
    const rating = 3.5 + (((product.id || 0) % 15) / 10);
    return Math.round(rating * 2) / 2; // Round to nearest 0.5
  }

  getProductRatingCount(product: any): number {
    // Return a static rating count between 15 and 150 based on product id
    return 15 + ((product.id || 0) % 135);
  }

  // TrackBy function for better performance with *ngFor
  trackByProductId(index: number, product: any): any {
    return product.id || index;
  }
}