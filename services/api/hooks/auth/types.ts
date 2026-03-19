import { User } from '@/store/slices/Auth/authSlice';

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignupParams {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  status: boolean;
  user: User;
  message: string;
}
