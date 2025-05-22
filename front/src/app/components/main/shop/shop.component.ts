import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import Swal from 'sweetalert2';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Cart 
  cart: {productId: number, quantity: number, product: any}[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
    // Check for existing cart in localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  loadProducts(): void {
    this.loading = true;
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
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
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
      // Fix: Remove the quotes around the URL concatenation
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
      window.scrollTo(0, 0);
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
    // Check if product is already in cart
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
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(this.cart));
    
    // Show toast notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${product.name} added to cart`,
      showConfirmButton: false,
      timer: 2000
    });
  }

  updateQuantity(product: any, quantity: any): void {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) return;
    
    const existingItem = this.cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity = numQuantity;
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(this.cart));
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
}