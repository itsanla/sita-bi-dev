'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// User interface remains the same
interface User {
  id: string;
  name: string;
  email: string;
  roles: Array<{ name: string }>;
  mahasiswa?: {
    nim: string;
    angkatan: string;
  };
  dosen?: {
    nidn: string;
  };
}

// AuthContextType is simplified: no token
interface AuthContextType {
  user: User | null;
  login: (user: User) => void; // Login function only takes user object
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // No more 'token' state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect now only runs once on mount to load user from localStorage
    const loadUserFromStorage = () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Login function is simplified
  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Logout function is simplified
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // Redirect to login page
    window.location.href = '/login';
  };

  // The provider value is simplified, no token
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
