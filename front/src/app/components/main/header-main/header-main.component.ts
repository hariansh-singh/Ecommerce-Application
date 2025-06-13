import {
  Component,
  inject,
  OnInit,
  HostListener,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../../services/auth-state.service';
import { CartService } from '../../../../services/cart.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ProductService } from '../../../../services/product.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { UserProfileService } from '../../../../services/user-profile.service';

@Component({
  selector: 'app-header-main',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header-main.component.html',
  styleUrls: ['./header-main.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate('0.3s ease-in-out')),
    ]),
  ],
  standalone: true,
})
export class HeaderMainComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';
  userId: any;
  userInfo: any;
  cartItemCount: number = 0;
  isScrolled: boolean = false;
  animationEnabled: boolean = true;
  searchQuery: string = '';

  searchQueryUpdated = new Subject<string>();

  authService = inject(AuthService);
  authState = inject(AuthStateService);
  cartService = inject(CartService);
  router: Router = inject(Router);
  userProfileService = inject(UserProfileService);

  userData: any = this.authService.decodedTokenData();
  // userid: any = this.userData['CustomerId'];
   userid: any = this.userData?.CustomerId ?? null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  ngOnInit(): void {
    this.userProfileService.getCustomerInfo(this.userid).subscribe({
      next: (data) => {
        if (data) {
          this.userInfo = data.data; // Ensure this matches API response structure
          console.log('User data:', this.userInfo);

          // Now that userInfo is available, initialize user details properly
          const token = this.authService.getToken();
          this.authState.setLoginState(!!token);

          if (token && this.userInfo) {
            this.userName = this.capitalizeFirstLetter(this.userInfo.name);
            this.userEmail = this.userInfo?.email || ''; // Use safe optional chaining
            this.userRole = this.userInfo?.role || '';
            this.userId = this.userInfo?.customerId || '';
          } else {
            console.warn('User data is missing or token is invalid.');
          }
        } else {
          console.warn('No user data found.');
        }
      },
      error: (error) => {
        console.error('Error fetching user info:', error);
      },
    });

    // Enable initial animations only on first load
    this.animationEnabled = true;
    setTimeout(() => {
      this.animationEnabled = false;
    }, 1500);

    // Subscribe to login status updates
    this.authState.loginStatus$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });

    // Subscribe to cart item count from CartService
    this.cartService.cartItemCount$.subscribe((count: number) => {
      // Add animation to cart icon when count changes
      if (
        isPlatformBrowser(this.platformId) &&
        count > 0 &&
        this.cartItemCount !== count
      ) {
        const cartIcon = document.querySelector('.animate-cart i');
        if (cartIcon) {
          cartIcon.classList.remove('cart-bounce');
          // Trigger reflow to restart animation - fixed with proper type casting
          void (cartIcon as HTMLElement).offsetWidth;
          cartIcon.classList.add('cart-bounce');
        }
      }

      this.cartItemCount = count;
    });

    this.searchQueryUpdated.pipe(debounceTime(300)).subscribe((query) => {
      this.onSearch(query);
    });
  }

  onSearch(query: string) {
    this.productService.setSearchQuery(query);
    this.router.navigate(['/shop']);
  }

  isSeller(): boolean {
    return this.userRole === 'seller';
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  // Function to capitalize the first letter of the user name
  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  signOut(): void {
    this.authService.logout();

    this.router.navigate(['/login']);
  }
}
