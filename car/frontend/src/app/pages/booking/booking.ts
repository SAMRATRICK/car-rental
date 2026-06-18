import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-booking',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  apiService = inject(ApiService);
  router = inject(Router);
  carList: any[] = [];
  bookingList: any[] = [];
  isLoading = false;
  lastUpdated = new Date();
  showModal = false;
  expandedBookingId: number | null = null;
  
  bookingForm: FormGroup = new FormGroup({
    bookingId: new FormControl(0),
    customerName: new FormControl("", [Validators.required]),
    customerCity: new FormControl("", [Validators.required]),
    mobileNo: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    carId: new FormControl("", [Validators.required]),
    bookingDate: new FormControl("", [Validators.required]),
    duration: new FormControl(1, [Validators.required, Validators.min(1)]),
    discount: new FormControl(0),
    totalBillAmount: new FormControl("", [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.getCarList();
    this.getBookings();
    this.setupAutoCalculation();
  }

  setupAutoCalculation() {
    this.bookingForm.get('carId')?.valueChanges.subscribe(() => this.calculateTotalAmount());
    this.bookingForm.get('duration')?.valueChanges.subscribe(() => this.calculateTotalAmount());
    this.bookingForm.get('discount')?.valueChanges.subscribe(() => this.calculateTotalAmount());
  }

  calculateTotalAmount() {
    const carId = this.bookingForm.get('carId')?.value;
    const duration = Number(this.bookingForm.get('duration')?.value || 1);
    const discount = Number(this.bookingForm.get('discount')?.value || 0);

    if (carId) {
      const selectedCar = this.carList.find(c => Number(c.carId) === Number(carId));
      if (selectedCar && selectedCar.dailyRate) {
        const rate = Number(selectedCar.dailyRate);
        const total = (rate * duration) - discount;
        this.bookingForm.get('totalBillAmount')?.setValue(total > 0 ? total : 0, { emitEvent: false });
      }
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleBookingDetails(bookingId: number) {
    this.expandedBookingId = this.expandedBookingId === bookingId ? null : bookingId;
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-warning';
    const iconClass = type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle';
    
    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="fa fa-${iconClass}"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    setTimeout(() => {
      const toastElement = document.getElementById(toastId);
      if (toastElement) {
        toastElement.classList.remove('show');
        setTimeout(() => toastElement.remove(), 300);
      }
    }, 3000);
  }

  getCarList() {
    this.apiService.getCars().subscribe({
      next: (res: any) => {
        if (res.result) {
          this.carList = res.data;
        }
      },
      error: (error) => {
        this.showToast('Error loading cars', 'danger');
      }
    });
  }

  getBookings() {
    this.apiService.getAllBookings().subscribe({
      next: (res: any) => {
        if (res.result) {
          this.bookingList = res.data;
          this.lastUpdated = new Date();
        }
      },
      error: (error) => {
        this.showToast('Error loading bookings', 'danger');
      }
    });
  }

  onSaveBooking() {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      const formValue = this.bookingForm.value;
      
      const isUpdate = formValue.bookingId && formValue.bookingId > 0;

      if (isUpdate) {
        const bookingData = {
          bookingId: parseInt(formValue.bookingId),
          customerName: formValue.customerName,
          customerCity: formValue.customerCity,
          mobileNo: formValue.mobileNo,
          email: formValue.email,
          carId: parseInt(formValue.carId),
          bookingDate: formValue.bookingDate,
          totalBillAmount: parseFloat(formValue.totalBillAmount),
          discount: parseFloat(formValue.discount) || 0
        };

        this.apiService.updateBooking(bookingData).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            
            if (res.result) {
              this.showToast("Booking updated successfully!", 'success');
              this.getBookings();
              this.resetForm();
              this.closeModal();
            } else {
              this.showToast(res.message || 'Failed to update booking', 'danger');
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.showToast('Error updating booking', 'danger');
          }
        });
      } else {
        const bookingData = {
          customerName: formValue.customerName,
          customerCity: formValue.customerCity,
          mobileNo: formValue.mobileNo,
          email: formValue.email,
          carId: parseInt(formValue.carId),
          bookingDate: formValue.bookingDate,
          totalBillAmount: parseFloat(formValue.totalBillAmount),
          discount: parseFloat(formValue.discount) || 0
        };

        this.apiService.createNewBooking(bookingData).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            
            if (res.result) {
              this.showToast("Booking created successfully!", 'success');
              this.getBookings();
              this.resetForm();
              this.closeModal();
            } else {
              this.showToast(res.message || 'Failed to create booking', 'danger');
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.showToast('Error creating booking', 'danger');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.showToast("Please fill all required fields correctly", 'warning');
    }
  }

  onDeleteBooking(bookingId: number) {
    if (!bookingId || bookingId <= 0) {
      this.showToast('Invalid booking ID', 'danger');
      return;
    }

    this.showConfirmToast('Are you sure you want to delete this booking?', () => {
      this.apiService.deleteBookingById(bookingId).subscribe({
        next: (res: any) => {
          if (res.result) {
            this.showToast("Booking deleted successfully!", 'success');
            this.getBookings();
          } else {
            this.showToast(res.message || 'Failed to delete booking', 'danger');
          }
        },
        error: (error) => {
          this.showToast('Error deleting booking', 'danger');
        }
      });
    });
  }

  showConfirmToast(message: string, onConfirm: () => void) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    // Remove any existing confirmation toasts
    const existingConfirmToasts = toastContainer.querySelectorAll('[id^="confirm-toast-"]');
    existingConfirmToasts.forEach(toast => toast.remove());

    const toastId = 'confirm-toast-' + Date.now();
    
    const toastHTML = `
      <div id="${toastId}" class="toast align-items-center text-white bg-warning border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex flex-column">
          <div class="toast-body">
            <i class="fa fa-exclamation-triangle"></i>
            ${message}
          </div>
          <div class="d-flex gap-2 p-2 pt-0">
            <button type="button" class="btn btn-sm btn-light flex-fill" onclick="document.getElementById('${toastId}').remove()">
              <i class="fa fa-times"></i> Cancel
            </button>
            <button type="button" class="btn btn-sm btn-danger flex-fill" id="${toastId}-confirm">
              <i class="fa fa-check"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const confirmBtn = document.getElementById(`${toastId}-confirm`);
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        onConfirm();
        document.getElementById(toastId)?.remove();
      });
    }
  }

  onEditBooking(booking: any) {
    let formattedDate = booking.bookingDate;
    if (formattedDate) {
      const date = new Date(formattedDate);
      formattedDate = date.toISOString().slice(0, 16);
    }

    let duration = 1;
    if (booking.carId) {
      const selectedCar = this.carList.find(c => c.carId === booking.carId);
      if (selectedCar && selectedCar.dailyRate && Number(selectedCar.dailyRate) > 0) {
        const rate = Number(selectedCar.dailyRate);
        const amount = Number(booking.totalBillAmount) + Number(booking.discount || 0);
        duration = Math.max(1, Math.round(amount / rate));
      }
    }
    
    this.bookingForm.patchValue({
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerCity: booking.customerCity,
      mobileNo: booking.mobileNo,
      email: booking.email,
      carId: booking.carId,
      bookingDate: formattedDate,
      duration: duration,
      discount: booking.discount || 0,
      totalBillAmount: booking.totalBillAmount
    });
    
    this.openModal();
  }

  onNewBooking() {
    this.resetForm();
    this.openModal();
  }

  resetForm() {
    this.bookingForm.reset();
    this.bookingForm.patchValue({
      bookingId: 0,
      duration: 1,
      discount: 0
    });
  }

  getCarDetails(carId: number) {
    const car = this.carList.find(c => c.carId === carId);
    return car ? `${car.regNo} - ${car.brand} ${car.model}` : `Car ID: ${carId}`;
  }

  private markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control && !control.valid && control.touched) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}
