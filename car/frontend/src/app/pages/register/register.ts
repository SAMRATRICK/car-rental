import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerObj: any = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  };
  
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  onRegister() {
    if (this.registerObj.password !== this.registerObj.confirmPassword) {
      this.toastService.error('Passwords do not match!');
      return;
    }

    if (!this.registerObj.fullName || !this.registerObj.username || !this.registerObj.email || !this.registerObj.password) {
      this.toastService.warning('Please fill in all fields!');
      return;
    }

    this.authService.register(
      this.registerObj.username,
      this.registerObj.fullName,
      this.registerObj.email, 
      this.registerObj.password,
      this.registerObj.role
    ).subscribe({
      next: (response) => {
        if (response.result) {
          this.toastService.success('Registration successful! Please login.');
          this.router.navigateByUrl('/login');
        } else {
          this.toastService.error(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
