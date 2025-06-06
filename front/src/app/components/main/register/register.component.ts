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
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import Swal from 'sweetalert2';

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

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  headingText: string = 'Create Account'; // Default heading

  myForm: FormGroup = new FormGroup(
    {
      FirstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      LastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      PhoneNumber: new FormControl('', [Validators.required]), // Assuming 10-digit phone number
      Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      ConfirmPassword: new FormControl('', [Validators.required]),
      Role: new FormControl('user', [Validators.required]), // Default to 'user'
      AgreeTerms: new FormControl(false, [Validators.requiredTrue]),
      // Seller-specific fields (conditionally validated)
      StoreName: new FormControl(''),
      GSTNumber: new FormControl(''),
      BusinessAddress: new FormControl(''),
    },
    { validators: this.passwordMatchValidator }
  );

  constructor() {
    // Add input focus animations
    this.setupInputAnimations();

    // Listen for role changes and update heading dynamically
    this.myForm.get('Role')?.valueChanges.subscribe((role) => {
      this.updateHeading(role);
      this.toggleSellerFields(role);
    });
  }

  toggleSellerFields(role: string) {
    if (role === 'seller') {
      this.myForm.get('StoreName')?.setValidators([Validators.required]);
      this.myForm.get('GSTNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{15}$/)]);
      this.myForm.get('BusinessAddress')?.setValidators([Validators.required, Validators.minLength(10)]);
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
    this.headingText = role === 'seller' ? 'Join as a Seller' : 'Create Account';
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
    const formData = {
      Name: `${this.myForm.value.FirstName + ' ' + this.myForm.value.LastName}`,
      Email: this.myForm.value.Email,
      PhoneNumber: this.myForm.value.PhoneNumber,
      Password: this.myForm.value.Password,
      Role: this.myForm.value.Role,
    };

    console.log('Role being sent:', formData.Role);

    this.authService.signUp(formData).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        console.log(data);

        if (data.err === 0) {
          // Show success message with animation
          this.showSuccessMessage();
          Swal.fire({
            icon: 'success',
            title: `Registration successful as ${formData.Role}!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
          // Navigate to login after successful registration
          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true' },
            });
          }, 2000);
        } else {
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
        console.error('Error during registration:', err);
        this.showErrorMessage('An error occurred. Please try again.');
      },
    });
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
