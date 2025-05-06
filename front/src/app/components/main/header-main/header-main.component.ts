import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../../services/auth-state.service';
import { CartService } from '../../../../services/cart.service'; // Import CartService

@Component({
  selector: 'app-header-main',
  imports: [CommonModule, RouterLink],
  templateUrl: './header-main.component.html',
  styleUrls: ['./header-main.component.css']
})
export class HeaderMainComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  cartItemCount: number = 0; // Variable to hold the cart item count

  authService = inject(AuthService);
  authState = inject(AuthStateService);
  cartService = inject(CartService); // Inject CartService
  router: Router = inject(Router);

  ngOnInit(): void {
    // Check login status
    this.authState.loginStatus$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    const token = this.authService.getToken();
    this.authState.setLoginState(!!token);

    let userData: any = null;

    if (token) {
      userData = this.authService.decodedTokenData();
      this.userName = userData?.['Name'] || '';
      this.userEmail = userData?.['Email'] || '';
    }

    
    console.log('Decoded Token:', userData);
    console.log('Extracted Name:', this.userName);


    // Subscribe to cart item count from CartService
    this.cartService.cartItemCount$.subscribe((count: number) => {
      this.cartItemCount = count;
    });
  }

  signOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('token');
      this.authState.setLoginState(false);
      this.router.navigate(['/login']);
    }
  }
}