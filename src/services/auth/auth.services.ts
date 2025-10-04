import toastHelper from '../../utils/toastHelper';
import api from "../api/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  role: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data?: {
    token?: string;
    user?: User;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileResponse {
  status: number;
  message: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
    role: string;
  };
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class EmailNotVerifiedError extends Error {
  constructor(message = "Email is not verified. Please check your inbox.") {
    super(message);
    this.name = "EmailNotVerifiedError";
  }
}

function persistSession(token?: string, user?: User): void {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export class AuthService {
  static login = async (loginData: LoginRequest): Promise<AuthResponse> => {
    try {
      const res = await api.post('/api/auth/login', loginData);
      const data: AuthResponse = res.data;
      const user = data?.data?.user;
      const token = data?.data?.token;

      // Check for email verification requirement
      const backendMessage = data.message?.toLowerCase() || '';
      if (backendMessage.includes('verify') && backendMessage.includes('email')) {
        throw new EmailNotVerifiedError(data.message);
      }

      if (data.status === 200 && token && user) {
        clearSession();
        persistSession(token, user);
        toastHelper.showTost(data.message || 'Login successful!', 'success');
        return data;
      }

      const warnMessage = data.message || 'Invalid credentials';
      toastHelper.showTost(warnMessage, 'warning');
      return data;
    } catch (err: any) {
      if (err instanceof EmailNotVerifiedError) {
        throw err;
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to login';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static getProfile = async (): Promise<ProfileResponse> => {
    try {
      const res = await api.put('/api/profile', {});
      const data: ProfileResponse = res.data;
      
      if (data.status === 200) {
        return data;
      }
      
      const errorMessage = data.message || 'Failed to load profile';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load profile';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static updateProfile = async (payload: UpdateProfileRequest): Promise<ProfileResponse> => {
    try {
      const res = await api.put('/api/profile', payload);
      const data: ProfileResponse = res.data;
      
      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Profile updated successfully', 'success');
        return data;
      }
      
      const errorMessage = data.message || 'Failed to update profile';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  static changePassword = async (payload: ChangePasswordRequest): Promise<ProfileResponse> => {
    try {
      const res = await api.post('/api/auth/change-password', payload);
      const data: ProfileResponse = res.data;

      if (data.status === 200) {
        toastHelper.showTost(data.message || 'Password changed successfully', 'success');
        return data;
      } else {
        const errorMessage = data.message || 'Failed to change password';
        toastHelper.showTost(errorMessage, 'warning');
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to change password';
      toastHelper.showTost(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };
}