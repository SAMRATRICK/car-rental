import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  step: 'username' | 'email' | 'otp' | 'reset' = 'username';
  username: string = '';
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  router = inject(Router);
  http = inject(HttpClient);
  toastService = inject(ToastService);

  // Step 1: Enter Username
  nextToEmail() {
    if (!this.username || this.username.trim() === '') {
      this.toastService.warning('Please enter your username');
      return;
    }

    this.username = this.username.trim();
    this.step = 'email';
  }

  // Step 2: Enter Email and Send OTP
  sendOtp() {
    if (!this.email || this.email.trim() === '') {
      this.toastService.warning('Please enter your registered Gmail ID');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.toastService.error('Please enter a valid email address');
      return;
    }

    this.http.post(`${environment.apiUrl}/forgot-password`, { 
      username: this.username, 
      email: this.email 
    }).subscribe({
      next: (response: any) => {
        if (response.result) {
          this.toastService.success('OTP sent to your registered email successfully!');
          this.step = 'otp';
        }
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        const errorMessage = error.error?.message || 'Invalid Username or Gmail ID';
        this.toastService.error(errorMessage);
      }
    });
  }

  // Step 3: Verify OTP
  verifyOtp() {
    if (!this.otp || this.otp.trim() === '') {
      this.toastService.warning('Please enter the OTP');
      return;
    }

    this.http.post(`${environment.apiUrl}/verify-otp`, { 
      username: this.username, 
      otp: this.otp.trim()
    }).subscribe({
      next: (response: any) => {
        if (response.result) {
          this.toastService.success('OTP verified successfully!');
          this.step = 'reset';
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Invalid OTP. Please try again.');
      }
    });
  }

  // Step 4: Reset Password
  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastService.warning('Please fill in all fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.warning('Password must be at least 6 characters long');
      return;
    }

    this.http.post(`${environment.apiUrl}/reset-password`, {
      username: this.username,
      otp: this.otp.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        if (response.result) {
          this.toastService.success('Password reset successfully! Please login with your new password.');
          this.router.navigateByUrl('/login');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to reset password. Please try again.');
      }
    });
  }

  // Navigation helpers
  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  backToUsername() {
    this.step = 'username';
    this.email = '';
  }

  backToEmail() {
    this.step = 'email';
    this.otp = '';
  }

  resendOtp() {
    this.otp = '';
    this.sendOtp();
  }
}
