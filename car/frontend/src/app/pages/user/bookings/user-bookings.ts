import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-bookings.html',
  styleUrl: './user-bookings.css'
})
export class UserBookings implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  userProfile: any = null;
  bookingsList = signal<any[]>([]);
  expandedBookingId = signal<number | null>(null);

  ngOnInit() {
    this.loadUserAndBookings();
  }

  loadUserAndBookings() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.userProfile = res.data;
          this.fetchUserBookings();
        }
      },
      error: () => {
        this.toastService.error('Failed to load user profile');
      }
    });
  }

  fetchUserBookings() {
    if (!this.userProfile?.email) return;

    this.apiService.getAllBookings().subscribe({
      next: (res: any) => {
        if (res.result && res.data) {
          // Filter bookings matching logged-in user email
          const filtered = res.data.filter((booking: any) => 
            booking.email?.toLowerCase() === this.userProfile.email?.toLowerCase()
          );
          // Sort by newest first
          filtered.sort((a: any, b: any) => (b.bookingId || b.id) - (a.bookingId || a.id));
          this.bookingsList.set(filtered);
        }
      },
      error: () => {
        this.toastService.error('Failed to load bookings');
      }
    });
  }

  toggleExpand(bookingId: number) {
    if (this.expandedBookingId() === bookingId) {
      this.expandedBookingId.set(null);
    } else {
      this.expandedBookingId.set(bookingId);
    }
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      this.apiService.deleteBookingById(bookingId).subscribe({
        next: (res: any) => {
          if (res.result) {
            this.toastService.success('Booking cancelled successfully.');
            this.fetchUserBookings();
          } else {
            this.toastService.error(res.message || 'Failed to cancel booking.');
          }
        },
        error: () => {
          this.toastService.error('Failed to connect to the server.');
        }
      });
    }
  }
}
