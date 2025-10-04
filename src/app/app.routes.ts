import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { unauthGuard } from './core/guards/unauth-guard';
import { UserRole } from './models/auth.models';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/sign-in', 
    pathMatch: 'full' 
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./features/auth/sign-in/sign-in').then(m => m.SignInComponent),
    canActivate: [unauthGuard]
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./features/auth/sign-up/sign-up').then(m => m.SignUpComponent),
    canActivate: [unauthGuard]
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard([UserRole.PATIENT])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/patient/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/patient/appointments/appointments').then(m => m.Appointments)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/patient/prescriptions/prescriptions').then(m => m.Prescriptions)
      }
    ]
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard([UserRole.DOCTOR])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/doctor/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'patients',
        loadComponent: () => import('./features/doctor/patients/patients').then(m => m.Patients)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/doctor/appointments/appointments').then(m => m.Appointments)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/doctor/prescriptions/prescriptions').then(m => m.Prescriptions)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'doctors',
        loadComponent: () => import('./features/admin/doctors/doctors').then(m => m.Doctors)
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/admin/departments/departments').then(m => m.Departments)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/admin/billing/billing').then(m => m.Billing)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports').then(m => m.Reports)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/sign-in'
  }
];
