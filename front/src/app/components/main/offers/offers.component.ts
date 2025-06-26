import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-offers',
  imports: [CommonModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent {
  promoCodes = [
    { name: 'Welcome Bonus', code: 'WELCOME10', description: 'Get 10% off your first purchase.' },
    { name: 'Flat ₹500 OFF', code: 'FLAT500', description: 'Instant ₹500 discount on orders above ₹2999.' },
    { name: 'Save Big', code: 'SAVE20', description: 'Save 20% on all electronics.' },
    { name: 'Summer Treat', code: 'SUMMER150', description: 'Flat ₹150 off this summer season.' },
    { name: 'Free Shipping', code: 'FREESHIP', description: 'Enjoy ₹100 worth of free delivery.' },
    { name: 'Monsoon Magic', code: 'RAINY300', description: 'Get ₹300 off during the monsoon sale.' },
    { name: 'Festival Frenzy', code: 'FESTIVE25', description: 'Celebrate with 25% off on festive collections.' },
    { name: 'Weekend Wow', code: 'WEEKEND50', description: '₹50 off every weekend order.' },
    { name: 'Combo Delight', code: 'COMBO20', description: 'Save 20% on product combos.' },
    ];

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.showSuccessToast('Promo code copied!');
    }).catch(() => {
      this.showErrorToast('Failed to copy code');
    });
  }
  constructor(private snackBar: MatSnackBar) { }

  showSuccessToast(message: string, title: string = 'Success'): void {
     Swal.fire({
       title: title,
       text: message,
       icon: 'success',
       toast: true,
       position: 'top-end',
       showConfirmButton: false,
       timer: 3000,
       timerProgressBar: true
     });
   }

  showErrorToast(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: 'error-toast' });
  }

}
