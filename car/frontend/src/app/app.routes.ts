import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Layout } from './pages/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Vehicles } from './pages/vehicles/vehicles';
import { Booking } from './pages/booking/booking';
import { Customer } from './pages/customer/customer';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Landing
    },
    {
        path: 'login',
        component: Login,
        canActivate: [loginGuard]
    },
    {
        path: 'register',
        component: Register,
        canActivate: [loginGuard]
    },
    {
        path: 'forgot-password',
        component: ForgotPassword,
        canActivate: [loginGuard]
    },
    {
        path: 'admin',
        component: Layout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'vehicles',
                component: Vehicles
            },
            {
                path: 'booking',
                component: Booking
            },
            {
                path: 'customers',
                component: Customer
            }
        ]
    }
];
