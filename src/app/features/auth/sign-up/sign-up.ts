import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { Department, UserRole } from '../../../models/auth.models';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  // Local state signals
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);
  departments = signal<Department[]>([]);
  selectedRole = signal<string>('');
  
  // Sign up form with nested groups
  signUpForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    role: ['', Validators.required],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)
    ]],
    confirmPassword: ['', Validators.required],
    patientData: this.fb.group({
      age: [0],
      gender: [''],
      bloodGroup: ['']
    }),
    doctorData: this.fb.group({
      specialization: [''],
      deptId: [0],
      availability: ['']
    })
  }, { validators: this.passwordMatchValidator });
  
  // Form controls for easy access
  get usernameControl() {
    return this.signUpForm.controls.username;
  }
  
  get emailControl() {
    return this.signUpForm.controls.email;
  }
  
  get phoneControl() {
    return this.signUpForm.controls.phone;
  }
  
  get roleControl() {
    return this.signUpForm.controls.role;
  }
  
  get passwordControl() {
    return this.signUpForm.controls.password;
  }
  
  get confirmPasswordControl() {
    return this.signUpForm.controls.confirmPassword;
  }
  
  constructor() {
    // Watch role changes to update selected role signal
    effect(() => {
      const roleValue = this.roleControl.value;
      this.selectedRole.set(roleValue);
      this.updateRoleValidators(roleValue);
    });
  }
  
  ngOnInit(): void {
    // Fetch departments for doctor registration
    this.loadDepartments();
    
    // Watch for role changes
    this.roleControl.valueChanges.subscribe(role => {
      this.selectedRole.set(role);
    });
  }
  
  loadDepartments(): void {
    this.http.get<Department[]>('/api/departments').subscribe({
      next: (deps) => this.departments.set(deps),
      error: () => {
        // Fallback mock departments if API fails
        this.departments.set([
          { deptId: 1, name: 'Cardiology' },
          { deptId: 2, name: 'Neurology' },
          { deptId: 3, name: 'Orthopedics' },
          { deptId: 4, name: 'Pediatrics' },
          { deptId: 5, name: 'General Medicine' }
        ]);
      }
    });
  }
  
  updateRoleValidators(role: string): void {
    const patientData = this.signUpForm.controls.patientData;
    const doctorData = this.signUpForm.controls.doctorData;
    
    // Clear all validators first
    patientData.controls.age.clearValidators();
    patientData.controls.gender.clearValidators();
    patientData.controls.bloodGroup.clearValidators();
    doctorData.controls.specialization.clearValidators();
    doctorData.controls.deptId.clearValidators();
    doctorData.controls.availability.clearValidators();
    
    // Add validators based on role
    if (role === UserRole.PATIENT) {
      patientData.controls.age.setValidators([Validators.required, Validators.min(1)]);
      patientData.controls.gender.setValidators(Validators.required);
      patientData.controls.bloodGroup.setValidators(Validators.required);
    } else if (role === UserRole.DOCTOR) {
      doctorData.controls.specialization.setValidators(Validators.required);
      doctorData.controls.deptId.setValidators([Validators.required, Validators.min(1)]);
      doctorData.controls.availability.setValidators(Validators.required);
    }
    
    // Update validity
    patientData.updateValueAndValidity();
    doctorData.updateValueAndValidity();
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
  
  togglePasswordVisibility(): void {
    this.showPassword.update(val => !val);
  }
  
  onSubmit(): void {
    if (this.signUpForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const formValue = this.signUpForm.getRawValue();
      const role = formValue.role as UserRole;
      
      // Build request payload based on role
      const signUpData: any = {
        username: formValue.username,
        email: formValue.email,
        phone: formValue.phone,
        password: formValue.password,
        role: role
      };
      
      if (role === UserRole.PATIENT) {
        signUpData.patientData = {
          age: formValue.patientData.age,
          gender: formValue.patientData.gender,
          bloodGroup: formValue.patientData.bloodGroup
        };
      } else if (role === UserRole.DOCTOR) {
        signUpData.doctorData = {
          specialization: formValue.doctorData.specialization,
          deptId: formValue.doctorData.deptId,
          availability: formValue.doctorData.availability
        };
      }
      
      this.authService.signUp(signUpData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('Account created successfully! Redirecting to sign in...');
          
          // Redirect to sign-in after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/sign-in']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.error?.message || 'Registration failed. Please try again.'
          );
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.signUpForm.markAllAsTouched();
    }
  }
}
