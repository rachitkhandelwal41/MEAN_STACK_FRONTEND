import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const unauthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  
  if (authService.isAuthenticated()) {
    // User is authenticated, redirect to their dashboard
    authService.navigateByRole();
    return false;
  }
  
  // User is not authenticated, allow access to auth pages
  return true;
};
