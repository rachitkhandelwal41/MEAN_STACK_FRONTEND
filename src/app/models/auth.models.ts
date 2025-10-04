export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface PatientSignUpData {
  age: number;
  gender: string;
  bloodGroup: string;
}

export interface DoctorSignUpData {
  specialization: string;
  deptId: number;
  availability: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  patientData?: PatientSignUpData;
  doctorData?: DoctorSignUpData;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface Department {
  deptId: number;
  name: string;
}

