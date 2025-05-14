import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../banner/banner.component';
import { RelatedDataComponent } from '../related-data/related-data.component';
import { ProductService } from '../../../../services/product.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [BannerComponent, RelatedDataComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  products: any[] = []; 
  cartService = inject(CartService);
  authService = inject(AuthService);
  decodedToken: any = this.authService.decodedTokenData();

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products = response.data.map((product : any) => ({
          ...product,
          selectedQuantity: 1 // ✅ Initialize quantity to 1
        }));
      },
      error: (error) => console.error('API Error:', error)
    });
  }

  increaseQuantity(product: any): void {
    if (product.selectedQuantity < product.stockQuantity) {
      product.selectedQuantity++;
    }
  }

  decreaseQuantity(product: any): void {
    if (product.selectedQuantity > 1) {
      product.selectedQuantity--;
    }
  }

  addToCart(product: any): void {
    if (!product.selectedQuantity || product.selectedQuantity <= 0 || product.selectedQuantity > product.stockQuantity) {
      alert('Invalid quantity selected!');
      return;
    }

    const cartItem = {
      customerId: this.decodedToken.CustomerId,
      productId: product.productId,
      quantity: product.selectedQuantity
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: () => console.log('Product added to cart:', cartItem),
      error: (error: any) => console.error('Failed to add product to cart', error)
    });
  }

  getStars(): number[] {
    return Array(4).fill(0).concat([0.5]); 
  }
}