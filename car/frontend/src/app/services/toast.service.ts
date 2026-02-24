import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastContainer: HTMLElement | null = null;

  constructor() {
    this.createToastContainer();
  }

  private createToastContainer() {
    if (typeof document !== 'undefined') {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      this.toastContainer.style.zIndex = '9999';
      document.body.appendChild(this.toastContainer);
    }
  }

  private show(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    if (!this.toastContainer) return;

    const toastId = `toast-${Date.now()}`;
    const bgClass = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info'
    }[type];

    const icon = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }[type];

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <strong>${icon}</strong> ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    this.toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      const bsToast = new (window as any).bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
      });
      bsToast.show();

      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }
}
