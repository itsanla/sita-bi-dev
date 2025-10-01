'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import request from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  roles: { name: string }[];
  mahasiswa?: {
    nim: string;
    angkatan: string;
  } | null;
  dosen?: {
    nidn: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const response = await request<{ data: User }>('/profile');
          setUser(response.data); // Ekstrak dan set hanya data pengguna
        } catch (error) {
          console.error('Failed to fetch user', error);
          Cookies.remove('token'); // Invalid token
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
