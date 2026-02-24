import { Component, inject, OnInit } from '@angular/core';
import { ApiResponse, CarModel } from '../../model/car';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, CommonModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {
  newCarObj: CarModel;
  apiService = inject(ApiService);
  carList: CarModel[] = [];
  showModal = false;
  minYear = 1990;
  maxYear = new Date().getFullYear() + 1;
  yearError: string = '';

  constructor() {
    this.newCarObj = new CarModel();
  }

  ngOnInit(): void {
    this.getAllCars();
  }

  openModal() {
    this.showModal = true;
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    // Re-enable body scroll when modal closes
    document.body.style.overflow = '';
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

  getAllCars() {
    this.apiService.getCars().subscribe((res: ApiResponse) => {
      if (res.result) {
        this.carList = res.data;
      }
    });
  }

  validateYear(): void {
    const year = this.newCarObj.year;
    
    if (!year) {
      this.yearError = 'Year is required';
      return;
    }
    
    if (year < this.minYear || year > this.maxYear) {
      this.yearError = `Invalid year! Please enter a year between ${this.minYear} and ${this.maxYear}`;
      return;
    }
    
    this.yearError = '';
  }

  onSaveCar() {
    // Validate year before saving
    this.validateYear();
    
    if (this.yearError) {
      this.showToast(this.yearError, 'danger');
      return;
    }
    
    // Remove carId from the object when creating a new car
    const { carId, ...carData } = this.newCarObj;
    
    this.apiService.createNewCar(carData).subscribe((res: any) => {
      if (res.result) {
        this.showToast("Vehicle added successfully!", 'success');
        this.getAllCars();
        this.resetForm();
        this.closeModal();
      } else {
        this.showToast(res.message, 'danger');
      }
    });
  }

  onUpdateCar() {
    // Validate year before updating
    this.validateYear();
    
    if (this.yearError) {
      this.showToast(this.yearError, 'danger');
      return;
    }
    
    // Only send the fields that the backend expects
    const updateData = {
      carId: this.newCarObj.carId,
      brand: this.newCarObj.brand,
      model: this.newCarObj.model,
      year: this.newCarObj.year,
      color: this.newCarObj.color,
      dailyRate: this.newCarObj.dailyRate,
      carImage: this.newCarObj.carImage,
      regNo: this.newCarObj.regNo
    };
    
    this.apiService.updateCar(updateData).subscribe((res: any) => {
      if (res.result) {
        this.showToast("Vehicle updated successfully!", 'success');
        this.getAllCars();
        this.resetForm();
        this.closeModal();
      } else {
        this.showToast(res.message, 'danger');
      }
    });
  }

  onDelCarById(id: number) {
    this.showConfirmToast('Are you sure you want to delete this vehicle?', () => {
      this.apiService.deleteCarById(id).subscribe((res: any) => {
        if (res.result) {
          this.showToast("Vehicle deleted successfully!", 'success');
          this.getAllCars();
        } else {
          this.showToast(res.message, 'danger');
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

  onEdit(data: CarModel) {
    this.newCarObj = { ...data };
    this.openModal();
  }

  onNewVehicle() {
    this.resetForm();
    this.openModal();
  }

  resetForm() {
    this.newCarObj = new CarModel();
    this.yearError = '';
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70';
  }
}
