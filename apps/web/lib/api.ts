// apps/web/lib/api.ts
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiResponse;
    return errorData?.message || 'Terjadi kesalahan pada server.';
  }
  return 'Gagal menghubungi server. Silakan coba lagi.';
};

export default api;
