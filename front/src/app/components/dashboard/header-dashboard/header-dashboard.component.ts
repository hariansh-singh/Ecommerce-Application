import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header-dashboard',
  imports: [RouterLink],
  templateUrl: './header-dashboard.component.html',
  styleUrl: './header-dashboard.component.css'
})
export class HeaderDashboardComponent implements OnInit {

  userData: any;
  authService = inject(AuthService);
  router: Router = inject(Router);

  ngOnInit(): void {
     var _token:any = this.authService.getToken();
     this.userData = jwtDecode(_token);
     console.log(this.userData);
   }

   signOut() {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('token'); // Remove the token
      this.router.navigate(['/']);
    }
  }
}
