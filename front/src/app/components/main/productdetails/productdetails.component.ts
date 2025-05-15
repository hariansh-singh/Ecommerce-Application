import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-productdetails',
  imports: [CommonModule],
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css'
})
export class ProductdetailsComponent implements OnInit {
  products: any = {}; // ✅ Ensure it's an object, not an array
  quantity: number = 1; // Default quantity
  cartService = inject(CartService);

  constructor(private productService: ProductService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const productIdStr = this.route.snapshot.paramMap.get('id');

    if (!productIdStr || isNaN(Number(productIdStr))) {
      console.error("Invalid Product ID:", productIdStr);
      return;
    }

    const productId = Number(productIdStr);
    console.log("Retrieved Product ID:", productId);

    this.productService.getProductById(productId).subscribe({
      next: (response: any) => {
        console.log("Full API Response:", response);

        if (response && response.data) {
          this.products = response.data;
          console.log("Assigned Product Object:", this.products); // ✅ Debugging log
        } else {
          console.error("API response does not contain expected 'data' property:", response);
        }
      },
      error: (err: any) => {
        console.error("Error fetching product:", err);
      }
    });
  }

  addToCart(): void {
    if (!this.products || !this.products.productId) {
      console.error("Invalid product object:", this.products);
      return;
    }

    this.cartService.addToCart(this.products); // ✅ Pass the correct product object
    console.log('Product added to cart:', this.products);
  }
}