import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    if (role === 'admin') {
      return true;
    } else if (role === 'user') {
      router.navigate(['/user/dashboard']);
      return false;
    }
  }
  router.navigate(['/login']);
  return false;
};

export const userGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    if (role === 'user') {
      return true;
    } else if (role === 'admin') {
      router.navigate(['/admin/dashboard']);
      return false;
    }
  }
  router.navigate(['/login']);
  return false;
};

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    if (role === 'user') {
      router.navigate(['/user/dashboard']);
    } else {
      router.navigate(['/admin/dashboard']);
    }
    return false;
  } else {
    return true;
  }
};