import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  apiService = inject(ApiService);

  features = [
    {
      icon: 'bi-car-front-fill',
      title: 'Wide Selection',
      description: 'Choose from our extensive fleet of premium vehicles'
    },
    {
      icon: 'bi-shield-check',
      title: 'Safe & Secure',
      description: 'All vehicles are regularly maintained and insured'
    },
    {
      icon: 'bi-clock-history',
      title: '24/7 Support',
      description: 'Round-the-clock customer service for your convenience'
    },
    {
      icon: 'bi-wallet2',
      title: 'Best Prices',
      description: 'Competitive rates with no hidden charges'
    }
  ];

  // Fallback cars in case DB is empty
  fallbackCars = [
    {
      brand: 'Toyota',
      model: 'Camry',
      dailyRate: 2500,
      carImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
    },
    {
      brand: 'BMW',
      model: 'X5',
      dailyRate: 6500,
      carImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'
    },
    {
      brand: 'Honda',
      model: 'Civic',
      dailyRate: 1800,
      carImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400'
    },
    {
      brand: 'Mercedes',
      model: 'C-Class',
      dailyRate: 5500,
      carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'
    },
    {
      brand: 'Hyundai',
      model: 'Creta',
      dailyRate: 2000,
      carImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'
    },
    {
      brand: 'Audi',
      model: 'A4',
      dailyRate: 5000,
      carImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400'
    }
  ];

  carsList: any[] = [];
  selectedCar: any = null;
  showBookingModal = false;
  isSubmitting = false;
  bookingSuccess = false;
  successMessage = '';
  promoMessage = '';
  appliedPromoCode = '';

  bookingForm = new FormGroup({
    customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    customerCity: new FormControl('', [Validators.required]),
    mobileNo: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    bookingDate: new FormControl('', [Validators.required]),
    duration: new FormControl(1, [Validators.required, Validators.min(1)]),
    promoCode: new FormControl(''),
    discount: new FormControl(0),
    totalBillAmount: new FormControl(0)
  });

  ngOnInit(): void {
    this.loadCars();
    this.setupAutoCalculation();
  }

  loadCars() {
    this.apiService.getCars().subscribe({
      next: (res: any) => {
        if (res.result && res.data && res.data.length > 0) {
          this.carsList = res.data;
        } else {
          this.carsList = this.fallbackCars;
        }
      },
      error: () => {
        this.carsList = this.fallbackCars;
      }
    });
  }

  setupAutoCalculation() {
    this.bookingForm.get('duration')?.valueChanges.subscribe(() => this.calculateTotal());
    this.bookingForm.get('promoCode')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  openBooking(car: any) {
    this.selectedCar = car;
    this.bookingSuccess = false;
    this.appliedPromoCode = '';
    this.promoMessage = '';
    this.bookingForm.reset({
      duration: 1,
      discount: 0,
      totalBillAmount: Number(car.dailyRate || 1000)
    });
    this.showBookingModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedCar = null;
    document.body.style.overflow = '';
  }

  calculateTotal() {
    if (!this.selectedCar) return;

    const rate = Number(this.selectedCar.dailyRate || 1000);
    const duration = Number(this.bookingForm.get('duration')?.value || 1);
    const baseTotal = rate * duration;
    
    // Promo Code check
    const promo = (this.bookingForm.get('promoCode')?.value || '').trim().toUpperCase();
    let discount = 0;
    
    if (promo === 'FIRSTCAR') {
      discount = Math.round(baseTotal * 0.1); // 10% discount
      this.promoMessage = '🎉 Coupon FIRSTCAR applied: 10% off!';
      this.appliedPromoCode = 'FIRSTCAR';
    } else if (promo === 'SAVEMORE') {
      discount = Math.round(baseTotal * 0.15); // 15% discount
      this.promoMessage = '🎉 Coupon SAVEMORE applied: 15% off!';
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

  submitBooking() {
    if (this.bookingForm.invalid || !this.selectedCar) {
      this.markFormTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.bookingForm.value;

    const bookingData = {
      customerName: formValue.customerName,
      customerCity: formValue.customerCity,
      mobileNo: formValue.mobileNo,
      email: formValue.email,
      carId: this.selectedCar.carId || this.selectedCar.id || 1,
      bookingDate: formValue.bookingDate,
      totalBillAmount: Number(formValue.totalBillAmount),
      discount: Number(formValue.discount || 0)
    };

    this.apiService.createNewBooking(bookingData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.result) {
          this.bookingSuccess = true;
          this.successMessage = `🎉 Your rental booking for ${this.selectedCar.brand} ${this.selectedCar.model} has been confirmed successfully! Booking ID: #${res.data.bookingId || res.data.id}.`;
        } else {
          alert(res.message || 'Failed to create booking. Please try again.');
        }
      },
      error: () => {
        this.isSubmitting = false;
        alert('An error occurred while creating your booking.');
      }
    });
  }

  private markFormTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToDashboard() {
    this.router.navigateByUrl('/admin/dashboard');
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400';
  }
}
