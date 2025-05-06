import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../banner/banner.component';
import { RelatedDataComponent } from '../related-data/related-data.component';
import { ProductService } from '../../../../services/product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-home',
  imports: [BannerComponent, RelatedDataComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: any[] = []; 
  cartService = inject(CartService);

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    // Fetch all products on initialization
    // this.productService.getAllProducts().subscribe({
    //   next: (response: any) => {
    //     console.log('API Response:', response);
    //     this.products = response.data;
    //   },
    //   error: (error) => {
    //     console.error('API Error:', error);
    //   }
    // });
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // Log the full API response
        this.products = response.data; // Check if `response.data` has `productName` and `price`
      },
      error: (error) => {
        console.error('API Error:', error); // Log error if the API fails
      }
    });
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product); 
    console.log('Product added to cart:', product); 
  }

  getStars(): number[] {
    return Array(4).fill(0).concat([0.5]); 
  }
}