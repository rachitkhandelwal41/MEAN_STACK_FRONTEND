import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../../models/auth.models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const userRole = authService.userRole();
    
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    
    // Redirect to appropriate dashboard or sign-in
    if (authService.isAuthenticated()) {
      authService.navigateByRole();
    } else {
      router.navigate(['/sign-in']);
    }
    return false;
  };
};
