import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { filter } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-customer',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit, AfterViewInit {
  apiService = inject(ApiService);
  router = inject(Router);
  
  @ViewChild('topCustomersCanvas') topCustomersCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cityChartCanvas') cityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('spendingTrendCanvas') spendingTrendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bookingsPerCustomerCanvas') bookingsPerCustomerCanvas!: ElementRef<HTMLCanvasElement>;

  customerList: any[] = [];
  bookingList: any[] = [];
  chartsData: any = null;
  showModal = false;
  mobileError: string = '';
  emailError: string = '';
  
  private charts: { [key: string]: Chart } = {};
  
  newCustomer = {
    customerId: 0,
    customerName: '',
    customerCity: '',
    mobileNo: '',
    email: ''
  };

  ngOnInit(): void {
    this.loadCustomerData();
    this.loadBookingData();
    
    // Refresh data when navigating back to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url.includes('/customers')) {
        this.loadBookingData();
        this.loadCustomerData();
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
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

  loadCustomerData() {
    this.apiService.getCustomers().subscribe((res: any) => {
      if (res.result) {
        this.customerList = res.data;
        this.chartsData = res.charts;
        
        // Create charts after data is loaded
        setTimeout(() => {
          this.createCharts();
        }, 100);
      }
    });
  }

  loadBookingData() {
    this.apiService.getAllBookings().subscribe((res: any) => {
      if (res.result) {
        this.bookingList = res.data;
      }
    });
  }

  validateMobile(): void {
    const mobile = this.newCustomer.mobileNo;
    
    if (!mobile) {
      this.mobileError = 'Mobile number is required';
      return;
    }
    
    // Check if it contains only digits
    if (!/^\d+$/.test(mobile)) {
      this.mobileError = 'Mobile number must contain only digits';
      return;
    }
    
    // Check if it's exactly 10 digits
    if (mobile.length  >10) {
      this.mobileError = 'enter a valid mobile no';
      return;
    }
    
    this.mobileError = '';
  }

  validateEmail(): void {
    const email = this.newCustomer.email;
    
    if (!email) {
      this.emailError = 'Email is required';
      return;
    }
    
    // Check if email ends with @gmail.com
    if (!email.endsWith('.com')) {
      this.emailError = 'enter a valid email';
      return;
    }
    
    // Check basic email format
    const emailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailPattern.test(email)) {
      this.emailError = 'Invalid email format';
      return;
    }
    
    this.emailError = '';
  }

  onSaveCustomer() {
    // Validate mobile and email before saving
    this.validateMobile();
    this.validateEmail();
    
    if (this.mobileError || this.emailError) {
      this.showToast('Please fix the validation errors', 'danger');
      return;
    }
    
    if (this.newCustomer.customerId === 0) {
      // Create - don't send customerId
      const { customerId, ...customerData } = this.newCustomer;
      
      this.apiService.createNewCustomer(customerData).subscribe((res: any) => {
        if (res.result) {
          this.showToast("Customer added successfully!", 'success');
          this.loadCustomerData();
          this.resetForm();
          this.closeModal();
        } else {
          this.showToast(res.message || 'Failed to add customer', 'danger');
        }
      });
    } else {
      // Update - send only required fields
      const updateData = {
        customerId: this.newCustomer.customerId,
        customerName: this.newCustomer.customerName,
        customerCity: this.newCustomer.customerCity,
        mobileNo: this.newCustomer.mobileNo,
        email: this.newCustomer.email
      };
      
      this.apiService.updateCustomer(updateData).subscribe((res: any) => {
        if (res.result) {
          this.showToast("Customer updated successfully!", 'success');
          this.loadCustomerData();
          this.resetForm();
          this.closeModal();
        } else {
          this.showToast(res.message || 'Failed to update customer', 'danger');
        }
      });
    }
  }

  onEditCustomer(customer: any) {
    this.newCustomer = { ...customer };
    this.openModal();
  }

  onDeleteCustomer(customerId: number) {
    this.showConfirmToast('Are you sure you want to delete this customer?', () => {
      this.apiService.deleteCustomerById(customerId).subscribe((res: any) => {
        if (res.result) {
          this.showToast("Customer deleted successfully!", 'success');
          this.loadCustomerData();
        } else {
          this.showToast(res.message || 'Failed to delete customer', 'danger');
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

  onNewCustomer() {
    this.resetForm();
    this.openModal();
  }

  resetForm() {
    this.newCustomer = {
      customerId: 0,
      customerName: '',
      customerCity: '',
      mobileNo: '',
      email: ''
    };
    this.mobileError = '';
    this.emailError = '';
  }

  getCustomerBookings(customerId: number) {
    return this.bookingList.filter(b => b.customerId === customerId);
  }

  getCustomerTotalSpent(customerId: number): number {
    const customerBookings = this.getCustomerBookings(customerId);
    return customerBookings.reduce((total, booking) => total + (booking.totalBillAmount || 0), 0);
  }

  getCustomerLastBooking(customerId: number): string | null {
    const customerBookings = this.getCustomerBookings(customerId);
    if (customerBookings.length === 0) return null;
    
    const lastBooking = customerBookings.reduce((latest, booking) => {
      return new Date(booking.bookingDate) > new Date(latest.bookingDate) ? booking : latest;
    });
    
    return lastBooking.bookingDate;
  }

  getTotalRevenue(): number {
    return this.customerList.reduce((total, customer) => {
      return total + this.getCustomerTotalSpent(customer.customerId);
    }, 0);
  }

  getAverageSpent(): number {
    if (this.customerList.length === 0) return 0;
    return this.getTotalRevenue() / this.customerList.length;
  }

  createCharts() {
    if (!this.chartsData) return;

    this.createTopCustomersChart();
    this.createCityChart();
    this.createSpendingTrendChart();
    this.createBookingsPerCustomerChart();
  }

  createTopCustomersChart() {
    if (!this.topCustomersCanvas || !this.chartsData.topCustomers) return;

    const ctx = this.topCustomersCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.topCustomers.map((d: any) => d.name);
    const data = this.chartsData.topCustomers.map((d: any) => d.total);

    this.charts['topCustomers'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Spent (₹)',
          data: data,
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: '#4F46E5',
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Spent: ₹${(context.parsed.x || 0).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value.toLocaleString()
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createCityChart() {
    if (!this.cityChartCanvas || !this.chartsData.customersByCity) return;

    const ctx = this.cityChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.customersByCity.map((d: any) => d.city);
    const data = this.chartsData.customersByCity.map((d: any) => d.count);

    const colors = [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
    ];

    this.charts['city'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed} customers`
            }
          }
        }
      }
    });
  }

  createSpendingTrendChart() {
    if (!this.spendingTrendCanvas || !this.chartsData.spendingTrend) return;

    const ctx = this.spendingTrendCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.spendingTrend.map((d: any) => d.month);
    const data = this.chartsData.spendingTrend.map((d: any) => d.spending);

    this.charts['spendingTrend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Customer Spending (₹)',
          data: data,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Spending: ₹${(context.parsed.y || 0).toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value.toLocaleString()
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createBookingsPerCustomerChart() {
    if (!this.bookingsPerCustomerCanvas || !this.chartsData.bookingsPerCustomer) return;

    const ctx = this.bookingsPerCustomerCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.chartsData.bookingsPerCustomer.map((d: any) => d.name);
    const data = this.chartsData.bookingsPerCustomer.map((d: any) => d.count);

    this.charts['bookingsPerCustomer'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Bookings',
          data: data,
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: '#F59E0B',
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Bookings: ${context.parsed.y || 0}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    // Clean up charts
    Object.values(this.charts).forEach(chart => chart.destroy());
  }
}
