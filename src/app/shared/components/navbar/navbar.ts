import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private authService = inject(AuthService);
  
  // Expose auth signals
  isAuthenticated = this.authService.isAuthenticated;
  userRole = this.authService.userRole;
  userName = this.authService.userName;
  
  // Local state for dropdowns
  showDropdown = signal(false);
  showMobileMenu = signal(false);
  
  toggleDropdown(): void {
    this.showDropdown.update(val => !val);
  }
  
  toggleMobileMenu(): void {
    this.showMobileMenu.update(val => !val);
  }
  
  onLogout(): void {
    this.authService.logout();
    this.showDropdown.set(false);
    this.showMobileMenu.set(false);
  }
  
  getUserInitial(): string {
    const name = this.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
  
  getDashboardRoute(): string {
    const role = this.userRole();
    if (role === 'PATIENT') return '/patient/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/';
  }
}
