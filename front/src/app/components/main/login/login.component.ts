import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthStateService } from '../../../../services/auth-state.service';

@Component({
  selector: 'app-login',
<<<<<<< HEAD
  standalone: true,
  imports: [ReactiveFormsModule],
=======
  imports: [RouterLink, ReactiveFormsModule],
>>>>>>> abbd3cb14004d446cd9030c2ddbd1c4a357937cb
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authService = inject(AuthService)
  authState = inject(AuthStateService);
  router = inject(Router);
  errMsg: string = ''; // Declare the variable
  myForm:FormGroup = new FormGroup(
    {
      Email :new FormControl('',[Validators.required, Validators.email]),
      Password :new FormControl('',[Validators.required])
    }
  );

  onSubmitLogin() {
    let formData = this.myForm.value;
    // formData.append("Email", formData.Email);
    // formData.append("Password", formData.Password);


    this.authService.signIn(formData)
     .subscribe({
      next: (data: any) => {
        console.log(data);
        
        if (data && data.token) {

          localStorage.setItem('token', data.token);
          try{
          const decodedToken: any = jwtDecode(data.token);
          console.log('Decoded Token:', decodedToken);

          this.authState.setLoginState(true);

          const userRole = decodedToken["Role"];
          if (userRole === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }catch (error) {
            this.errMsg = "Error decoding JWT token.";
            console.error('JWT decoding error:', error);
          }

        }else {
          this.errMsg = data?.msg ?? "Login failed due to unknown error.";
          console.error('Login failed:', this.errMsg);
        }
      },
      error: (err: any) => {
        this.errMsg = 'An error occurred during login';
        console.error('Login API error:', err);
        
      }      
    });

  }
}
