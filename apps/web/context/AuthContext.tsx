'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api, { handleApiError } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (_token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<{ data: User }>('/auth/me');
      if (response.data && response.data.data) {
        setUser(response.data.data);
      } else {
        // Handle cases where API returns success but no user data
        setUser(null);
        Cookies.remove('token');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', handleApiError(error));
      setUser(null);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (_token: string) => {
    Cookies.set('token', _token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
    });
    await fetchUserProfile();
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('token');
    router.push('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated }}
    >
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
