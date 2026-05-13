import { apiClient } from '@/services/http/client';
import { LoginRequest, RegisterRequest, AuthResponse } from './auth.types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<any> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
