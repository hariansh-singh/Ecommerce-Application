import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  authService = inject(AuthService)
  router = inject(Router)

  myForm:FormGroup = new FormGroup(
    {
      Name :new FormControl('',[Validators.required]),
      Email :new FormControl('',[Validators.required]),
      Password :new FormControl('',[Validators.required]),
<<<<<<< HEAD
      // PhoneNumber :new FormControl('',[Validators.required]),
      // Age :new FormControl('',[Validators.required]),
=======
>>>>>>> abbd3cb14004d446cd9030c2ddbd1c4a357937cb
    }
  )

  onSubmitRegister() {
    let formData = this.myForm.value;
    this.authService.signUp(formData).subscribe({
      next: (data: any) => {
        console.log(data);
        alert("Registration successful!");
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        alert("Registration failed. Please try again.");
      }
    });
  }
}
