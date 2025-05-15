import { Component } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../services/cart.service';
import { inject } from '@angular/core';
@Component({
  selector: 'app-related-data',
  imports: [RouterLink,CommonModule],
  templateUrl: './related-data.component.html',
  styleUrl: './related-data.component.css'
})
export class RelatedDataComponent {
hoverCard(event: any) {
    event.target.style.transform = "scale(1.05)";
  }
  
  leaveCard(event: any) {
    event.target.style.transform = "scale(1)";
  }
  
  hoverImage(event: any) {
    event.target.style.transform = "scale(1.1)";
  }
  
  leaveImage(event: any) {
    event.target.style.transform = "scale(1)";
  }
  
  hoverButton(event: any) {
    event.target.style.backgroundColor = "#343a40";
    event.target.style.color = "white";
    event.target.style.transform = "scale(1.1)";
  }
  
  leaveButton(event: any) {
    event.target.style.backgroundColor = "";
    event.target.style.color = "";
    event.target.style.transform = "scale(1)";
  }
  
  products: any= [];
  cartService = inject(CartService);
  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(
      {
        next:(data:any) => {
          console.log("API Response:", data); // Debugging step
          this.products = data.data; // Assuming the response structure is correct
        },
        error: (error: any) => {
          console.error("API Error:", error); // Debugging step
        }
      }
    );
  }
   addToCart(product: any): void {
    this.cartService.addToCart(product); 
    console.log('Product added to cart:', product); 
  }
}
