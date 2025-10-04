import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth';
import { UserRole } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private authService = inject(AuthService);
  
  // Re-export auth service signals for convenience
  user = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  userRole = this.authService.userRole;
  userName = this.authService.userName;
  
  // Additional user-specific computed signals
  isPatient = computed(() => this.userRole() === UserRole.PATIENT);
  isDoctor = computed(() => this.userRole() === UserRole.DOCTOR);
  isAdmin = computed(() => this.userRole() === UserRole.ADMIN);
  
  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }
  
  /**
   * Check if user can access route based on allowed roles
   */
  canAccessRoute(allowedRoles: UserRole[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? allowedRoles.includes(currentRole) : false;
  }
}
