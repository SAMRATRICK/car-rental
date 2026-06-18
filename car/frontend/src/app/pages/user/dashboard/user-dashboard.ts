import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toastService = inject(ToastService);

  carsList: any[] = [];
  filteredCars: any[] = [];
  selectedCar: any = null;

  // Filters
  brandFilter = '';
  colorFilter = '';
  rateFilter: number | null = null;

  // Flow State
  showBookingModal = false;
  bookingStep: 'details' | 'payment' | 'success' = 'details';
  isSubmitting = false;
  successMessage = '';

  // Promo Code
  promoMessage = '';
  appliedPromoCode = '';

  // User Profile
  userProfile: any = null;

  bookingForm = new FormGroup({
    customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    customerCity: new FormControl('', [Validators.required]),
    mobileNo: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    bookingDate: new FormControl('', [Validators.required]),
    duration: new FormControl(1, [Validators.required, Validators.min(1)]),
    promoCode: new FormControl(''),
    customColor: new FormControl(''),
    gps: new FormControl(false),
    insurance: new FormControl(false),
    discount: new FormControl(0),
    totalBillAmount: new FormControl(0)
  });

  // Payment Form Controls
  paymentForm = new FormGroup({
    cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{16}$/)]),
    cardExpiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]),
    cardCvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
    cardName: new FormControl('', [Validators.required, Validators.minLength(3)])
  });

  ngOnInit() {
    this.loadProfileAndCars();
    this.setupAutoCalculation();
  }

  loadProfileAndCars() {
    // 1. Get profile
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.userProfile = res.data;
          this.bookingForm.patchValue({
            customerName: res.data.fullName || res.data.username,
            email: res.data.email,
            mobileNo: res.data.phone || ''
          });
        }
      }
    });

    // 2. Get cars
    this.apiService.getCars().subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.carsList = res.data;
          this.filteredCars = [...res.data];
        }
      }
    });
  }

  setupAutoCalculation() {
    this.bookingForm.get('duration')?.valueChanges.subscribe(() => this.calculateTotal());
    this.bookingForm.get('promoCode')?.valueChanges.subscribe(() => this.calculateTotal());
    this.bookingForm.get('gps')?.valueChanges.subscribe(() => this.calculateTotal());
    this.bookingForm.get('insurance')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  applyFilters() {
    this.filteredCars = this.carsList.filter(car => {
      const brandMatch = !this.brandFilter || car.brand.toLowerCase().includes(this.brandFilter.toLowerCase());
      const colorMatch = !this.colorFilter || car.color.toLowerCase().includes(this.colorFilter.toLowerCase());
      const rateMatch = !this.rateFilter || Number(car.dailyRate) <= this.rateFilter;
      return brandMatch && colorMatch && rateMatch;
    });
  }

  resetFilters() {
    this.brandFilter = '';
    this.colorFilter = '';
    this.rateFilter = null;
    this.filteredCars = [...this.carsList];
  }

  openBooking(car: any) {
    this.selectedCar = car;
    this.bookingStep = 'details';
    this.appliedPromoCode = '';
    this.promoMessage = '';
    
    this.bookingForm.patchValue({
      duration: 1,
      discount: 0,
      customColor: car.color,
      gps: false,
      insurance: false,
      totalBillAmount: Number(car.dailyRate)
    });

    // Re-fill user info if profile loaded
    if (this.userProfile) {
      this.bookingForm.patchValue({
        customerName: this.userProfile.fullName || this.userProfile.username,
        email: this.userProfile.email,
        mobileNo: this.userProfile.phone || ''
      });
    }

    this.showBookingModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showBookingModal = false;
    this.selectedCar = null;
    document.body.style.overflow = '';
  }

  calculateTotal() {
    if (!this.selectedCar) return;

    const rate = Number(this.selectedCar.dailyRate);
    const duration = Number(this.bookingForm.get('duration')?.value || 1);
    let baseTotal = rate * duration;

    // Addons
    if (this.bookingForm.get('gps')?.value) {
      baseTotal += 150 * duration; // ₹150/day GPS
    }
    if (this.bookingForm.get('insurance')?.value) {
      baseTotal += 350 * duration; // ₹350/day insurance
    }

    // Promo Code check
    const promo = (this.bookingForm.get('promoCode')?.value || '').trim().toUpperCase();
    let discount = 0;

    if (promo === 'FIRSTCAR') {
      discount = Math.round(baseTotal * 0.1);
      this.promoMessage = '🎉 Coupon FIRSTCAR: 10% off!';
      this.appliedPromoCode = 'FIRSTCAR';
    } else if (promo === 'SAVEMORE') {
      discount = Math.round(baseTotal * 0.15);
      this.promoMessage = '🎉 Coupon SAVEMORE: 15% off!';
      this.appliedPromoCode = 'SAVEMORE';
    } else if (promo) {
      this.promoMessage = '❌ Invalid Coupon Code';
      this.appliedPromoCode = '';
    } else {
      this.promoMessage = '';
      this.appliedPromoCode = '';
    }

    const finalBill = Math.max(0, baseTotal - discount);

    this.bookingForm.patchValue({
      discount: discount,
      totalBillAmount: finalBill
    }, { emitEvent: false });
  }

  proceedToPayment() {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      this.toastService.warning('Please fill in all booking details correctly.');
      return;
    }
    this.bookingStep = 'payment';
    this.paymentForm.reset();
  }

  backToDetails() {
    this.bookingStep = 'details';
  }

  processPayment() {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      this.toastService.warning('Please enter valid payment details.');
      return;
    }

    this.isSubmitting = true;
    
    // Simulate payment processing time
    setTimeout(() => {
      this.submitBooking();
    }, 2000);
  }

  submitBooking() {
    const formValue = this.bookingForm.value;
    const bookingData = {
      customerName: formValue.customerName,
      customerCity: formValue.customerCity,
      mobileNo: formValue.mobileNo,
      email: formValue.email,
      carId: this.selectedCar.id || this.selectedCar.carId,
      bookingDate: formValue.bookingDate,
      totalBillAmount: Number(formValue.totalBillAmount),
      discount: Number(formValue.discount || 0)
    };

    this.apiService.createNewBooking(bookingData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.result) {
          this.bookingStep = 'success';
          this.successMessage = `🎉 Your rental booking for ${this.selectedCar.brand} ${this.selectedCar.model} has been confirmed successfully! Booking ID is #${res.data.bookingId || res.data.id}.`;
          this.toastService.success('Booking & Payment Successful!');
        } else {
          this.toastService.error(res.message || 'Failed to create booking.');
          this.bookingStep = 'details';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error('An error occurred during booking creation.');
        this.bookingStep = 'details';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400';
  }
}
