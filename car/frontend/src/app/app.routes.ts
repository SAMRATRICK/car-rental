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
import { adminGuard, userGuard, loginGuard } from './guards/auth.guard';
import { UserLayout } from './pages/user/layout/user-layout';
import { UserDashboard } from './pages/user/dashboard/user-dashboard';
import { UserBookings } from './pages/user/bookings/user-bookings';

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
        canActivate: [adminGuard],
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
    },
    {
        path: 'user',
        component: UserLayout,
        canActivate: [userGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: UserDashboard
            },
            {
                path: 'bookings',
                component: UserBookings
            }
        ]
    }
];
