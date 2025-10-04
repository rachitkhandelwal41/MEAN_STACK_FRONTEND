import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Local state signals
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  
  // Sign in form
  signInForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  // Form controls for easy access
  get emailControl() {
    return this.signInForm.controls.email;
  }
  
  get passwordControl() {
    return this.signInForm.controls.password;
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }
  
  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      const { email, password } = this.signInForm.getRawValue();
      
      this.authService.signIn(email, password).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Navigate based on user role
          this.authService.navigateByRole();
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message || 'Invalid email or password. Please try again.'
          );
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.signInForm.markAllAsTouched();
    }
  }
}
