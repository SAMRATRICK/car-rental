import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginObj: any = {
    username: '',
    password: ''
  };
  
  router = inject(Router);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  onLogin() {
    this.authService.login(this.loginObj.username, this.loginObj.password).subscribe({
      next: (response) => {
        if (response.result) {
          const role = this.authService.getUserRole();
          if (role === 'user') {
            this.router.navigateByUrl('/user/dashboard');
          } else {
            this.router.navigateByUrl('/admin/dashboard');
          }
        } else {
          this.toastService.error(response.message || 'Invalid credentials. Please try again.');
        }
      },
      error: (error) => {
        this.toastService.error('Login failed. Please check your credentials and try again.');
        console.error('Login error:', error);
      }
    });
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToForgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }
}
