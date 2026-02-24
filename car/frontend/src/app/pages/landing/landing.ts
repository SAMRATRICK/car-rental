import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  router = inject(Router);
  authService = inject(AuthService);

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

  cars = [
    {
      name: 'Toyota Camry',
      type: 'Sedan',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
    },
    {
      name: 'BMW X5',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'
    },
    {
      name: 'Honda Civic',
      type: 'Sedan',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400'
    },
    {
      name: 'Mercedes C-Class',
      type: 'Luxury',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400'
    },
    {
      name: 'Hyundai Creta',
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'
    },
    {
      name: 'Audi A4',
      type: 'Luxury',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400'
    }
  ];

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
}
