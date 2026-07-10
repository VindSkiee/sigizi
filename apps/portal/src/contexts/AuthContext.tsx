'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginEmail, getCurrentUser } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SPPG_ADMIN' | 'SUPPLIER' | 'PUBLIC';
  supplierId?: string;
  sppgId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupplier: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users - fallback saat backend tidak tersedia
const mockUsers = [
  {
    email: 'supplier@sumbermakmur.com',
    password: 'supplier123',
    user: {
      id: 'sup-001',
      email: 'supplier@sumbermakmur.com',
      name: 'PT Sumber Makmur',
      role: 'SUPPLIER' as const,
      supplierId: 'sup-9921',
    },
  },
  {
    email: 'admin@sppg.go.id',
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@sppg.go.id',
      name: 'Budi Santoso',
      role: 'SPPG_ADMIN' as const,
      sppgId: 'sppg-001',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isSupplier = user?.role === 'SUPPLIER';
  const isAdmin = user?.role === 'SPPG_ADMIN';

  const login = async (email: string, password: string) => {
    // 1. Coba login ke backend
    try {
      const response = await loginEmail(email, password);
      if (response.success) {
        const data = response.data as { token: string; user: User };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return;
      }
    } catch (err) {
      console.log('Backend tidak tersedia, mencoba mock login...');
    }

    // 2. Fallback ke mock login
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (mockUser) {
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      setToken(mockToken);
      setUser(mockUser.user);
    } else {
      throw new Error('Email atau password salah');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isSupplier,
        isAdmin,
        login,
        logout,
      }}
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
