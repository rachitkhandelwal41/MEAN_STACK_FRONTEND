import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, SignInRequest, SignUpRequest, UserRole } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals for reactive state
  private currentUserSignal = signal<User | null>(null);
  private authTokenSignal = signal<string | null>(null);
  
  // Public readonly signals
  currentUser = this.currentUserSignal.asReadonly();
  authToken = this.authTokenSignal.asReadonly();
  
  // Computed signals
  isAuthenticated = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role ?? null);
  userName = computed(() => this.currentUser()?.username ?? '');
  
  /**
   * Sign in user with email and password
   */
  signIn(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          this.setAuthData(response.user, response.token);
        })
      );
  }
  
  /**
   * Register new user
   */
  signUp(userData: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', userData);
  }
  
  /**
   * Logout current user
   */
  logout(): void {
    this.currentUserSignal.set(null);
    this.authTokenSignal.set(null);
    localStorage.removeItem('auth_token');
    this.router.navigate(['/sign-in']);
  }
  
  /**
   * Set authentication data
   */
  setAuthData(user: User, token: string): void {
    this.currentUserSignal.set(user);
    this.authTokenSignal.set(token);
    // Store token for persistence (consider httpOnly cookies in production)
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  }
  
  /**
   * Check auth status on app init
   */
  checkAuthStatus(): Observable<User> {
    return this.http.get<User>('/api/auth/me').pipe(
      tap(user => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          this.setAuthData(user, token);
        }
      })
    );
  }
  
  /**
   * Navigate user based on their role
   */
  navigateByRole(): void {
    const role = this.userRole();
    switch(role) {
      case UserRole.PATIENT:
        this.router.navigate(['/patient/dashboard']);
        break;
      case UserRole.DOCTOR:
        this.router.navigate(['/doctor/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/sign-in']);
    }
  }
}
