import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header-admin',
  imports: [RouterLink],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.css'
})
export class HeaderAdminComponent implements OnInit {

  userData: any;
  authService = inject(AuthService);
  router: any = inject(Router);

  ngOnInit(): void {
      let _token:any = this.authService.getToken();
      this.userData = jwtDecode(_token);
      console.log(this.userData);
    }

  redirectToHome() {
  this.router.navigate(['/']); // Redirects to homepage
  }
}
