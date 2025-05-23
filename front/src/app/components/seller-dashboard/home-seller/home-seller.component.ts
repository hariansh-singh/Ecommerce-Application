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

  products:any[] = [];
 
  productService = inject(ProductService)
 
  ngOnInit(): void {
    this.productService.getAllProducts()
      .subscribe(
      {
        next:(data:any) => {
          console.log("API Response:", data); // Debugging step
          this.products = data.data;
        },
        error: (error) => {
          console.error("API Error:", error); // Debugging step
        }
      }
    );
  }
 
  deleteProduct(id: number): void {
        if (confirm("Are you sure you want to delete this product?")) {
          this.productService.deleteProduct(id).subscribe({
            next: () => {
              // Remove the deleted product from the frontend
              this.products = this.products.filter((product:any) => product.productId !== id);
              console.log(`Product with ID ${id} deleted`);
            },
            error: (error) => {
              console.error("Error deleting product:", error);
            }
          });
        }
      }
}
