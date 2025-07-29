import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthServices } from '../../services/auth-services';
import { loginModel } from '../../models/auth.model';


@Component({
  selector: 'app-authenticate',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './authenticate.html',
  styleUrl: './authenticate.css'
})
export class Authenticate {
  private authService = inject(AuthServices);
  private router = inject(Router);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);


  login() {
    if (this.email.valid && this.password.valid) {
      if (this.email.value && this.password.value) {
        const loginData: loginModel = {
          email: this.email.value,
          password: this.password.value
        };
        console.log('Login data:', loginData);
      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.router.navigate(['/']); // Redirect to dashboard or another page
          // Handle successful login, e.g., redirect to dashboard
        },
        error: (error) => {
          console.error('Login failed', error);
          // Handle login error, e.g., show an error message
        }
      });
    } else {
      console.error('Form is invalid');
      // Handle form validation errors
    }
    }
  }
}
