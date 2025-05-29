import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
 
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
 
  authService = inject(AuthService);
  authState = inject(AuthStateService);
  router = inject(Router);
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
 
 myForm: FormGroup = new FormGroup({
    FirstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    LastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    ConfirmPassword: new FormControl('', [Validators.required]),
     Role: new FormControl('', [Validators.required]),  // Add this line
    AgreeTerms: new FormControl(false, [Validators.requiredTrue])
  }, { validators: this.passwordMatchValidator });


 
  constructor() {
    // Add input focus animations
    this.setupInputAnimations();
  }
 
  private setupInputAnimations(): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.form-input');
      inputs.forEach(input => {
        input.addEventListener('focus', this.handleInputFocus);
        input.addEventListener('blur', this.handleInputBlur);
      });
    }, 100);
  }
 
  private handleInputFocus = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const wrapper = input.closest('.input-wrapper');
    wrapper?.classList.add('focused');
  }
 
  private handleInputBlur = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const wrapper = input.closest('.input-wrapper');
    if (!input.value) {
      wrapper?.classList.remove('focused');
    }
  }
 
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('Password');
    const confirmPassword = formGroup.get('ConfirmPassword');
   
    if (password && confirmPassword && password.value !== confirmPassword.value) {
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
      alert("Please fill in all fields correctly!");
      return;
    }

    this.isLoading = true;

    const formData = { 
      Name: `${this.myForm.value.FirstName + ' ' + this.myForm.value.LastName}`,
      Email: this.myForm.value.Email,
      Password: this.myForm.value.Password,
      Role: this.myForm.value.Role  // Added Role for debugging
    };

    console.log("Role being sent:", formData.Role); // Debugging log

    this.authService.signUp(formData)
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          console.log(data);

          if (data.err === 0) {
            this.showSuccessMessage();
            
            alert(`Registration successful as ${formData.Role}!`); // Added role-based alert
            
            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { registered: 'true' }
              });
            }, 2000);
          } else {
            console.error('Registration failed:', data.msg);
            this.showErrorMessage(data.msg || 'Registration failed. Please try again.');
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error during registration:', err);
          this.showErrorMessage('An error occurred. Please try again.');
        }
      });
}

 
  private markFormGroupTouched(): void {
    Object.keys(this.myForm.controls).forEach(key => {
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
 
  get agreeTermsControl() {
    return this.myForm.get('AgreeTerms');
  }
}

 

// import { Component, inject } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService } from '../../../../services/auth.service';
// import { Router } from '@angular/router';
// import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

// @Component({
//   selector: 'app-register',
//   imports: [ReactiveFormsModule],
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.css'
// })
// export class RegisterComponent {

//   authService = inject(AuthService);
//   router = inject(Router);

//   passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//     const password = control.get('Password')?.value;
//     const confirmPassword = control.get('ConfirmPassword')?.value;
//     return password === confirmPassword ? null : { mismatch: true };
//   };

//   myForm: FormGroup = new FormGroup({
//     Name: new FormControl('', [Validators.required]),
//     Email: new FormControl('', [Validators.required, Validators.email]),
//     Password: new FormControl('', [Validators.required]),
//     ConfirmPassword: new FormControl('', [Validators.required]),
//     Role: new FormControl('User') // Default role is 'User'
//   }, { validators: this.passwordMatchValidator });

//   setRole(event: any) {
//     this.myForm.patchValue({ Role: event.target.value });
//   }

//   onSubmitRegister() {
//     if (this.myForm.invalid) {
//       alert("Please fill in all fields correctly!");
//       return;
//     }

//     let formData = this.myForm.value;
//   console.log("Role being sent:", formData.Role); // Debugging log
//     this.authService.signUp(formData).subscribe({
//       next: (data: any) => {
//         console.log(data);
//         alert(`Registration successful as ${formData.Role}!`);
//         this.router.navigate(['/login']);
//       },
//       error: (err: any) => {
//         console.error(err);
//         alert("Registration failed. Please try again.");
//       }
//     });
//   }
// }
