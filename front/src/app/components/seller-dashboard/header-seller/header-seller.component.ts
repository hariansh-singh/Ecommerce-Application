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
  userData: any;
  authService = inject(AuthService);
  router: Router = inject(Router);
  showLogoutDropdown: boolean = false;

  ngOnInit(): void {
    let _token:any = this.authService.getToken();
    this.userData = jwtDecode(_token);
    console.log(this.userData);
  }

  redirectToHome() {
  this.router.navigate(['/']); // Redirects to homepage
  }

  signOut() {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('token'); // Remove the token
      this.router.navigate(['/']); // Redirect to home page
    }
  }
}