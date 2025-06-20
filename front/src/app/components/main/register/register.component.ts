import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import Swal from 'sweetalert2';
import { SellerDetailsService } from '../../../../services/seller-details.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  authService = inject(AuthService);
  authState = inject(AuthStateService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  sellerDetailsService = inject(SellerDetailsService);


  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  headingText: string = 'Create Account'; // Default heading

  myForm: FormGroup = new FormGroup(
    {
      FirstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      LastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      PhoneNumber: new FormControl('', [Validators.required]), // Assuming 10-digit phone number
      Password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      ConfirmPassword: new FormControl('', [Validators.required]),
      Role: new FormControl('user', [Validators.required]), // Default to 'user'
      AgreeTerms: new FormControl(false, [Validators.requiredTrue]),
      // Seller-specific fields (conditionally validated)
      sellerId: new FormControl(''),
      StoreName: new FormControl(''),
      GSTNumber: new FormControl(''),
      BusinessAddress: new FormControl(''),
    },
    { validators: this.passwordMatchValidator }
  );
  authStateService: any;

  constructor() {
    // Add input focus animations
    this.setupInputAnimations();

    // Listen for role changes and update heading dynamically
    this.myForm.get('Role')?.valueChanges.subscribe((role) => {
      this.updateHeading(role);
      this.toggleSellerFields(role);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('📦 queryParams received:', params); // 🔍 Debug
      const tokenFromURL = params['token'];

      if (tokenFromURL) {
        // Google login flow: store and redirect
        const expirationTime = 7 * 24 * 60 * 60 * 1000; // Set expiration to 7 days
        const expirationDate = new Date(new Date().getTime() + expirationTime);
        localStorage.setItem('token', tokenFromURL);
        localStorage.setItem('tokenExpiration', expirationDate.toISOString());


        const payload = JSON.parse(atob(tokenFromURL.split('.')[1]));
        console.log('👤 Logged in as:', payload.name);
        console.log('🔐 Role:', payload.role);

        // Notify auth state
        this.authState.setLoginState(true);

        this.router.navigate(['/']); // Redirect only if token came from URL
      }
    });
  }



  toggleSellerFields(role: string) {
    if (role === 'seller') {
      this.myForm.get('StoreName')?.setValidators([Validators.required]);
      this.myForm
        .get('GSTNumber')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{15}$/)]);
      this.myForm
        .get('BusinessAddress')
        ?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      this.myForm.get('StoreName')?.clearValidators();
      this.myForm.get('GSTNumber')?.clearValidators();
      this.myForm.get('BusinessAddress')?.clearValidators();
    }
    this.myForm.get('StoreName')?.updateValueAndValidity();
    this.myForm.get('GSTNumber')?.updateValueAndValidity();
    this.myForm.get('BusinessAddress')?.updateValueAndValidity();
  }

  updateHeading(role: string): void {
    this.headingText =
      role === 'seller' ? 'Join as a Seller' : 'Create Account';
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

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('Password');
    const confirmPassword = formGroup.get('ConfirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError('passwordMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  setRole(event: any) {
    this.myForm.patchValue({ Role: event.target.value });
  }

  onSubmitRegister(): void {
    if (this.myForm.invalid) {
      console.log(this.myForm.errors);
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    // Base user registration data (same for both buyer and seller)
    const userData = {
      Name: `${this.myForm.value.FirstName + ' ' + this.myForm.value.LastName}`,
      Email: this.myForm.value.Email,
      PhoneNumber: this.myForm.value.PhoneNumber,
      Password: this.myForm.value.Password,
      Role: this.myForm.value.Role,
    };

    console.log('Role being sent:', userData.Role);
    console.log('User registration data:', userData);

    // First, register the user
    this.authService.signUp(userData).subscribe({
      next: (data: any) => {
        console.log('User registration response:', data);

        if (data.err === 0) {
          // If user registration is successful and role is seller
          if (this.myForm.value.Role === 'seller') {
            // Prepare seller-specific data
            const sellerData = {
              sellerId: data.userId, // Assuming the API returns a seller ID
              StoreName: this.myForm.value.StoreName,
              GSTNumber: this.myForm.value.GSTNumber,
              BusinessAddress: this.myForm.value.BusinessAddress,
              // You might also need to include user ID or email to link seller details
              // UserId: data.userId, // Uncomment if your API returns user ID
              // Email: userData.Email, // Or use email to identify the user
            };

            console.log('Seller details data:', sellerData);

            // Call the seller details API
            this.sellerDetailsService.addSellerDetails(sellerData).subscribe({
              next: (sellerResponse: any) => {
                this.isLoading = false;
                console.log('Seller details response:', sellerResponse);

                if (sellerResponse.err === 0) {
                  this.handleSuccessfulRegistration('seller');
                } else {
                  // Handle seller details creation failure
                  Swal.fire({
                    icon: 'warning',
                    title: 'Registration Completed',
                    text: 'User account created but seller details could not be saved. Please update your profile later.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 4000,
                  });
                  this.navigateToLogin();
                }
              },
              error: (sellerErr: any) => {
                this.isLoading = false;
                console.error('Error saving seller details:', sellerErr);

                // User is registered but seller details failed
                Swal.fire({
                  icon: 'warning',
                  title: 'Partial Registration',
                  text: 'Account created but seller details could not be saved. Please complete your profile after login.',
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 4000,
                });
                this.navigateToLogin();
              },
            });
          } else {
            // For buyers, registration is complete
            this.isLoading = false;
            this.handleSuccessfulRegistration('buyer');
          }
        } else {
          // User registration failed
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Registration failed',
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
        console.error('Error during user registration:', err);
        this.showErrorMessage(
          'An error occurred during registration. Please try again.'
        );
      },
    });
  }

  // Helper method to handle successful registration
  private handleSuccessfulRegistration(role: string): void {
    this.showSuccessMessage();
    Swal.fire({
      icon: 'success',
      title: `Registration successful as ${role}!`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });
    this.navigateToLogin();
  }

  // Helper method to navigate to login
  private navigateToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login'], {
        queryParams: { registered: 'true' },
      });
    }, 2000);
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
        <span>Registration Successful! Redirecting to login...</span>
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

  // Getter methods for easier template access
  onGoogleLogin(): void {
    // Redirect to your backend's Google login endpoint
    window.location.href = 'https://localhost:7116/api/Auth/google-login';
  }


  get firstNameControl() {
    return this.myForm.get('FirstName');
  }

  get lastNameControl() {
    return this.myForm.get('LastName');
  }

  get emailControl() {
    return this.myForm.get('Email');
  }

  get passwordControl() {
    return this.myForm.get('Password');
  }

  get confirmPasswordControl() {
    return this.myForm.get('ConfirmPassword');
  }

  get roleControl() {
    return this.myForm.get('Role');
  }

  get agreeTermsControl() {
    return this.myForm.get('AgreeTerms');
  }
}
