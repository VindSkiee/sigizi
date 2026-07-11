'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/features/auth/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { loginEmail } from '@/lib/api';

// Mock users - fallback saat backend tidak tersedia
const mockUsers = [
  {
    email: 'supplier@sumbermakmur.com',
    password: 'supplier123',
    user: {
      id: 'sup-001',
      email: 'supplier@sumbermakmur.com',
      name: 'PT Sumber Makmur',
      role: 'SUPPLIER',
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
      role: 'SPPG_ADMIN',
      sppgId: 'sppg-001',
    },
  },
];

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Coba login ke backend
    try {
      const response = await loginEmail(email, password);
      if (response.success) {
        const data = response.data as { token: string; user: any };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('[LOGIN] Backend login berhasil, redirecting...');
        window.location.href = data.user.role === 'SUPPLIER' ? '/supplier' : '/admin';
        return;
      }
    } catch (err: any) {
      console.log('[LOGIN] Backend tidak tersedia:', err.message);
    }

    // 2. Fallback ke mock login
    console.log('[LOGIN] Menggunakan mock login...');
    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (mockUser) {
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      console.log('[LOGIN] Mock login berhasil:', mockUser.user.email, '-> redirecting ke', mockUser.user.role === 'SUPPLIER' ? '/supplier' : '/admin');

      // Force full page reload untuk pastikan AuthContext load dari localStorage
      window.location.href = mockUser.user.role === 'SUPPLIER' ? '/supplier' : '/admin';
    } else {
      console.log('[LOGIN] Email/password tidak cocok dengan mock users');
      setError('Email atau password salah. Silakan coba lagi.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 md:p-10">
        <Logo className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Masukkan Email"
            placeholder="contoh: budi@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Masukkan Kata Sandi"
            placeholder="Masukkan Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Daftar sebagai supplier!{' '}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline">
            Klik disini
          </Link>
        </p>
      </Card>
    </div>
  );
}
