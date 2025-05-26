import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  authService = inject(AuthService);
  router = inject(Router);

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('Password')?.value;
    const confirmPassword = control.get('ConfirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  };

  myForm: FormGroup = new FormGroup({
    Name: new FormControl('', [Validators.required]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('', [Validators.required]),
    ConfirmPassword: new FormControl('', [Validators.required]),
    Role: new FormControl('User') // Default role is 'User'
  }, { validators: this.passwordMatchValidator });

  setRole(event: any) {
    this.myForm.patchValue({ Role: event.target.value });
  }

  onSubmitRegister() {
    if (this.myForm.invalid) {
      alert("Please fill in all fields correctly!");
      return;
    }

    let formData = this.myForm.value;
  console.log("Role being sent:", formData.Role); // Debugging log
    this.authService.signUp(formData).subscribe({
      next: (data: any) => {
        console.log(data);
        alert(`Registration successful as ${formData.Role}!`);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        alert("Registration failed. Please try again.");
      }
    });
  }
}
