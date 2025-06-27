import { Component,OnInit  } from '@angular/core';

interface SoldProduct {
  name: string;
  quantity: number;
  thumbnail: string;
}
@Component({
  selector: 'app-sales',
  imports: [],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
 totalItemsSold = 0;
  totalRevenue = 0;
  bestSeller: SoldProduct | null = null;
  soldProducts: SoldProduct[] = [];

  ngOnInit(): void {
    // Simulated sample data - replace this with real API call later
    this.soldProducts = [
      { name: 'Wireless Mouse', quantity: 150, thumbnail: 'assets/products/mouse.jpg' },
      { name: 'Bluetooth Headphones', quantity: 110, thumbnail: 'assets/products/headphones.jpg' },
      { name: 'USB-C Cable', quantity: 75, thumbnail: 'assets/products/usb-c.jpg' },
      { name: 'Laptop Stand', quantity: 45, thumbnail: 'assets/products/laptop-stand.jpg' }
    ];

    this.calculateSummary();
  }

  calculateSummary(): void {
    this.totalItemsSold = this.soldProducts.reduce((sum, product) => sum + product.quantity, 0);
    this.totalRevenue = this.soldProducts.reduce((sum, product) => {
      // You can store price per product if needed — using dummy pricing here
      const priceMap: Record<string, number> = {
        'Wireless Mouse': 999,
        'Bluetooth Headphones': 1999,
        'USB-C Cable': 299,
        'Laptop Stand': 1599
      };
      return sum + (priceMap[product.name] || 0) * product.quantity;
    }, 0);

    this.bestSeller = this.soldProducts.reduce((max, product) => 
      product.quantity > (max?.quantity ?? 0) ? product : max, null as any
    );
  }
}
