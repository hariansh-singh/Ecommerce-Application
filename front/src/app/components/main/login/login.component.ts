import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthStateService } from '../../../../services/auth-state.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import {
  ManageProfilesService,
  User,
} from '../../../../services/manageProfilesServices/manage-profiles.service';
import { SellerDetailsService } from '../../../../services/seller-details.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoading = false;
  rememberMe: boolean = false;

  myForm: FormGroup = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('', [Validators.required]),
    RememberMe: new FormControl(false), // Add Remember Me in the form
  });

  constructor(
    private authService: AuthService,
    private manageProfileService: ManageProfilesService,
    private authState: AuthStateService,
    private sellerDetailsService: SellerDetailsService,
    private router: Router
  ) {
    this.setupInputAnimations();
  }

  private setupInputAnimations(): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.form-input');
      inputs.forEach((input) => {
        input.addEventListener('focus', this.handleInputFocus);
        input.addEventListener('blur', this.handleInputBlur);
      });
    }, 100);
  }

  private handleInputFocus = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const wrapper = input.closest('.input-wrapper');
    wrapper?.classList.add('focused');
  };

  private handleInputBlur = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const wrapper = input.closest('.input-wrapper');
    if (!input.value) {
      wrapper?.classList.remove('focused');
    }
  };

  onSubmitLogin(): void {
    if (this.myForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.myForm.value;
    this.rememberMe = formData.RememberMe;

    this.authService.signIn(formData).subscribe({
      next: (data: any) => {
        console.log('Login response:', data);

        if (data.err === 0 && data.token) {
          // Decode token first
          const tokenData: any = jwtDecode(data.token);
          console.log('Token data:', tokenData);

          // Check if tokenData and CustomerId exist
          if (!tokenData || !tokenData['CustomerId']) {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Login Error',
              text: 'Invalid token data. Please try again.',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
            });
            return;
          }

          const userId = tokenData['CustomerId'];
          console.log('User ID from token:', userId);

          // Now check user status BEFORE proceeding with login
          this.manageProfileService.getUserById(Number(userId)).subscribe({
            next: (userData: any) => {
              console.log('User Data:', userData);
              const userStatus = userData.data.userStatus;
              console.log('User Status:', userStatus);

              if (userStatus === 0) {
                this.isLoading = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Account Inactive',
                  text: 'Your account is inactive. Please contact support.',
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#d33',
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  customClass: {
                    popup: 'custom-dialog-toast',
                  },
                });
                return;
              }

              // Check if user is seller and verify seller details
              const userType = userData.data.userType; // Assuming userType field exists

              if (userType === 'seller' || userType === 2) {
                // Adjust condition based on your user type logic
                this.checkSellerDetails(userId, data, tokenData);
              } else {
                // User is not a seller, proceed with normal login
                this.completeLogin(data, tokenData);
              }
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error fetching user data:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Could not verify user status. Please try again.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
              });
            },
          });
        } else {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Login failed',
            text: data.msg || 'Please try again.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error during login:', err);
        this.showErrorMessage('An error occurred. Please try again.');
      },
    });
  }

  // New method to check seller details
  private checkSellerDetails(
    sellerId: string,
    loginData: any,
    tokenData: any
  ): void {
    this.sellerDetailsService.getSellerDetailsById(Number(sellerId)).subscribe({
      next: (sellerResponse: any) => {
        console.log('Seller details response:', sellerResponse);

        // Check if seller details exist (adjust condition based on your API response structure)
        if (
          sellerResponse &&
          sellerResponse.data &&
          sellerResponse.data.sellerId
        ) {
          // Seller details exist, proceed with login
          this.completeLogin(loginData, tokenData);
        } else {
          // Seller details don't exist, show dialog to fill details
          this.showSellerDetailsRequiredDialog();
        }
      },
      error: (error) => {
        console.error('Error fetching seller details:', error);

        // If error is 404 or similar (seller details not found), show dialog
        if (
          error.status === 404 ||
          (error.error && error.error.msg === 'Seller not found')
        ) {
          this.showSellerDetailsRequiredDialog();
        } else {
          // Other errors, show generic error
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not verify seller details. Please try again.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      },
    });
  }

  // New method to show seller details required dialog
  private showSellerDetailsRequiredDialog(): void {
    this.isLoading = false;

    Swal.fire({
      icon: 'warning',
      title: 'Seller Details Required',
      text: 'Please complete your seller profile to access the website.',
      confirmButtonText: 'Fill Details',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'custom-dialog-toast',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to seller details form/page
        this.router.navigate(['/seller-details-form']); // Adjust route as needed
      } else {
        // User cancelled, stay on login page
        console.log('User cancelled seller details completion');
      }
    });
  }

  // Extract the login completion logic to a separate method
  private completeLogin(data: any, tokenData: any): void {
    // Store token based on Remember Me selection
    const expirationTime = 7 * 24 * 60 * 60 * 1000; // Set expiration to 7 days
    const expirationDate = new Date(new Date().getTime() + expirationTime);

    // Store token and expiration date
    if (this.rememberMe) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenExpiration', expirationDate.toISOString());
    } else {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('tokenExpiration', expirationDate.toISOString());
    }

    this.authState.setLoginState(true);
    const userRole = tokenData['Role'];

    this.showSuccessMessage();
    this.isLoading = false; // Set loading to false here

    setTimeout(() => {
      if (userRole === 'admin') {
        this.router.navigate(['/admindashboard']);
      } else if (userRole === 'seller') {
        this.router.navigate(['/sellerdashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.myForm.controls).forEach((key) => {
      const control = this.myForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage(): void {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-check-circle"></i>
        <span>Login Successful!</span>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  private showErrorMessage(message: string): void {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }


    onGoogleLogin(): void {
    // Redirect to your backend's Google login endpoint
    window.location.href = 'https://localhost:7116/api/Auth/google-login';
  }

  // Getter methods for easier template access
  get emailControl() {
    return this.myForm.get('Email');
  }

  get passwordControl() {
    return this.myForm.get('Password');
  }
}
