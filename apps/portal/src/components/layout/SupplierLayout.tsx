'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierSidebar } from './SupplierSidebar';
import { SupplierHeader } from './SupplierHeader';

export function SupplierLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isSupplier } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isSupplier) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, isSupplier, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !isSupplier) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierSidebar />
      <div className="ml-64">
        <SupplierHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
