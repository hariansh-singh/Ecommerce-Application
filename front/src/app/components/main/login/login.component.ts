import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthStateService } from '../../../../services/auth-state.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})


export class LoginComponent {

  authService = inject(AuthService)
  authState = inject(AuthStateService);
  router = inject(Router);

  myForm:FormGroup = new FormGroup(
    {
      Email :new FormControl('',[Validators.required, Validators.email]),
      Password :new FormControl('',[Validators.required])
    }
  )

  onSubmitLogin() {
    let formData = this.myForm.value;
    // formData.append("Email", formData.Email);
    // formData.append("Password", formData.Password);


    this.authService.signIn(formData)
     .subscribe({
      next: (data: any) => {
        console.log(data);
        
        if (data.err === 0 && data.token) {

          localStorage.setItem('token', data.token);

          const decodedToken: any = jwtDecode(data.token);
          console.log('Decoded Token:', decodedToken);

          this.authState.setLoginState(true);

          const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          if (userRole === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/']);
          }

          alert("Login Successful!");
        } else {
          console.error('Login failed:', data.msg);
        }
      },
      error: (err: any) => {
        console.error('Error during login:', err);
      }
    });

  }
}
