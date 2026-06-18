import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, CommonModule],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  isMenuOpen = signal(false);
  showProfileModal = signal(false);
  showEmailChangeModal = signal(false);
  emailChangeStep = signal<'request' | 'verify' | 'change'>('request');

  userProfile: any = {
    username: 'Loading...',
    fullName: '',
    email: '',
    phone: '',
    profilePicture: ''
  };

  profileForm: any = {
    email: '',
    phone: '',
    profilePicture: ''
  };

  emailChangeForm: any = {
    currentEmail: '',
    otp: '',
    newEmail: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  ngOnInit() {
    setTimeout(() => {
      this.loadProfile();
    }, 100);
  }

  loadProfile() {
    const token = this.authService.getToken();
    if (!token) {
      this.userProfile.username = 'User';
      this.toastService.error('Please login again');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response && response.data) {
          const profilePictureUrl = this.authService.getProfilePictureUrl(
            response.data.profilePicture,
            response.data.fullName || response.data.username || 'User'
          );

          this.userProfile = {
            username: response.data.username || 'User',
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            profilePicture: profilePictureUrl
          };
          this.profileForm = {
            email: response.data.email || '',
            phone: response.data.phone || '',
            profilePicture: profilePictureUrl
          };
        } else {
          this.userProfile.username = 'User';
        }
      },
      error: (error) => {
        this.userProfile.username = 'User';
        if (error.status === 401) {
          this.toastService.error('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.toastService.error('Failed to load profile');
        }
      }
    });
  }

  toggleIcon() {
    this.isMenuOpen.update(value => !value);
  }

  openProfileModal() {
    this.showProfileModal.set(true);
    this.previewUrl = null;
    this.selectedFile = null;
  }

  closeProfileModal() {
    this.showProfileModal.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Image size should be less than 5MB');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    if (this.profileForm.phone && !/^[0-9+\-\s()]*$/.test(this.profileForm.phone)) {
      this.toastService.error('Phone number can only contain numbers and formatting characters');
      return;
    }

    const updateData: any = {
      email: this.profileForm.email,
      phone: this.profileForm.phone
    };

    this.authService.updateProfile(updateData, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (response.result && response.data) {
          this.toastService.success('Profile updated successfully!');
          const profilePictureUrl = this.authService.getProfilePictureUrl(
            response.data.profilePicture,
            response.data.fullName || response.data.username || 'User'
          );

          this.userProfile = {
            username: response.data.username || this.userProfile.username,
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            profilePicture: profilePictureUrl
          };
          this.profileForm = {
            email: response.data.email || '',
            phone: response.data.phone || '',
            profilePicture: profilePictureUrl
          };
          this.closeProfileModal();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to update profile');
      }
    });
  }

  openEmailChangeModal() {
    this.showEmailChangeModal.set(true);
    this.emailChangeStep.set('request');
    this.emailChangeForm = {
      currentEmail: this.userProfile.email,
      otp: '',
      newEmail: ''
    };
  }

  closeEmailChangeModal() {
    this.showEmailChangeModal.set(false);
    this.emailChangeStep.set('request');
  }

  requestEmailChangeOtp() {
    if (!this.emailChangeForm.currentEmail) {
      this.toastService.error('Please enter your current email');
      return;
    }

    this.authService.requestEmailChange(this.emailChangeForm.currentEmail).subscribe({
      next: (response) => {
        if (response.result) {
          this.toastService.success('OTP sent to your email!');
          this.emailChangeStep.set('verify');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to send OTP');
      }
    });
  }

  verifyEmailChangeOtp() {
    if (!this.emailChangeForm.otp) {
      this.toastService.error('Please enter the OTP');
      return;
    }

    this.authService.verifyEmailOtp(this.emailChangeForm.otp).subscribe({
      next: (response) => {
        if (response.result) {
          this.toastService.success('OTP verified! Enter your new email');
          this.emailChangeStep.set('change');
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Invalid OTP');
      }
    });
  }

  submitEmailChange() {
    if (!this.emailChangeForm.newEmail) {
      this.toastService.error('Please enter your new email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailChangeForm.newEmail)) {
      this.toastService.error('Please enter a valid email address');
      return;
    }

    this.authService.changeEmail(this.emailChangeForm.otp, this.emailChangeForm.newEmail).subscribe({
      next: (response) => {
        if (response.result && response.data) {
          this.toastService.success('Email changed successfully!');
          const profilePictureUrl = this.authService.getProfilePictureUrl(
            response.data.profilePicture,
            response.data.fullName || response.data.username || 'User'
          );

          this.userProfile = {
            username: response.data.username || this.userProfile.username,
            fullName: response.data.fullName || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            profilePicture: profilePictureUrl
          };
          this.profileForm.email = response.data.email || '';
          this.closeEmailChangeModal();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to change email');
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
