import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, FormsModule, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  isMenuOpen = signal(false);
  showProfileModal = signal(false);
  showEmailChangeModal = signal(false);
  emailChangeStep = signal<'request' | 'verify' | 'change'>('request');

  // userProfile: any = {
  //   username: 'Loading...',
  //   fullName: '',
  //   email: '',
  //   phone: '',
  //   profilePicture: 'https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff&size=150'
  // };

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
    // Add a small delay to ensure token is available
    setTimeout(() => {
      this.loadProfile();
    }, 100);
  }

  loadProfile() {
    const token = localStorage.getItem('authToken');
    console.log('=== Profile Loading Debug ===');
    console.log('1. Token exists:', !!token);
    if (token) {
      console.log('2. Token preview:', token.substring(0, 30) + '...');
      console.log('3. Token length:', token.length);
    } else {
      console.log('2. Token is NULL or EMPTY');
    }
    console.log('4. API URL:', `${this.authService['baseUrl']}/profile`);

    if (!token) {
      console.error('❌ No auth token found in localStorage!');
      console.log('Available localStorage keys:', Object.keys(localStorage));
      this.userProfile.username = 'User';
      this.toastService.error('Please login again');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    console.log('5. Making API call to get profile...');
    this.authService.getProfile().subscribe({
      next: (response) => {
        console.log('6. ✅ Profile API Success!');
        console.log('7. Full response:', JSON.stringify(response, null, 2));

        if (response && response.data) {
          console.log('8. Response has data');
          console.log('9. Username from response:', response.data.username);
          console.log('10. Profile picture from API:', response.data.profilePicture);

          // Use the helper method to get the correct profile picture URL
          const profilePictureUrl = this.authService.getProfilePictureUrl(
            response.data.profilePicture,
            response.data.fullName || response.data.username || 'User'
          );

          console.log('11. Resolved profile picture URL:', profilePictureUrl);

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
          console.log('12. ✅ Username set to:', this.userProfile.username);
          console.log('13. ✅ Full Name set to:', this.userProfile.fullName);
        } else {
          console.warn('❌ Invalid response structure:', response);
          this.userProfile.username = 'User';
        }
      },
      error: (error) => {
        console.error('❌ Profile API Error!');
        console.error('Error object:', error);
        console.error('Status code:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        console.error('URL:', error.url);

        this.userProfile.username = 'User';

        if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Token is invalid or expired');
          this.toastService.error('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 0) {
          console.error('❌ Network error - Backend might not be running');
          this.toastService.error('Cannot connect to server. Please check if backend is running.');
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('Image size should be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview for display
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    // Validate phone number (numbers only)
    if (this.profileForm.phone && !/^[0-9+\-\s()]*$/.test(this.profileForm.phone)) {
      this.toastService.error('Phone number can only contain numbers and formatting characters');
      return;
    }

    const updateData: any = {
      email: this.profileForm.email,
      phone: this.profileForm.phone
    };

    // Send the actual file, not base64
    this.authService.updateProfile(updateData, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (response.result && response.data) {
          this.toastService.success('Profile updated successfully!');

          // Use the helper method to get the correct profile picture URL
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
        console.error('Update error:', error);
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

          // Use the helper method to get the correct profile picture URL
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
