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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  authState = inject(AuthStateService);
  router = inject(Router);
  isLoading = false;

  myForm: FormGroup = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('', [Validators.required]),
  });

  constructor() {
    // Add input focus animations
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

    this.authService.signIn(formData).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        console.log(data);

        if (data.err === 0 && data.token) {
          localStorage.setItem('token', data.token);

          const decodedToken: any = this.authService.decodedTokenData();
          console.log('Decoded Token:', decodedToken);

          this.authState.setLoginState(true);

          const userRole = decodedToken['Role'];

          // Show success message with animation
          this.showSuccessMessage();

          // Navigate after a brief delay for better UX
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
        else {
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

  // Getter methods for easier template access
  get emailControl() {
    return this.myForm.get('Email');
  }

  get passwordControl() {
    return this.myForm.get('Password');
  }
}
