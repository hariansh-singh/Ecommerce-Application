import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-seller',
  imports: [RouterModule],
  templateUrl: './header-seller.component.html',
  styleUrl: './header-seller.component.css'
})
export class HeaderSellerComponent implements OnInit {
  userData: any = {};
  userName: string = ''; // Updated to use "Name" instead of "FullName"
  authService = inject(AuthService);
  router: Router = inject(Router);

  ngOnInit(): void {
    const _token: any = this.authService.getToken();
    
    if (_token) {
      try {
        this.userData = jwtDecode(_token);
        this.userName = this.capitalizeFirstLetter(this.userData?.Name || "Seller"); // Ensure capitalization
        console.log("Decoded User Data:", this.userData); // Debugging check
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }

  // Function to Capitalize First Letter
  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  redirectToHome() {
  this.router.navigate(['/']); // Redirects to homepage without logging out
}

  signOut() {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('token'); 
      this.router.navigate(['/']);
    }
  }
}

