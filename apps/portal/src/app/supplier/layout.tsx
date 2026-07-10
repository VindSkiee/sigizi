'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SupplierLayout } from '@/components/layout/SupplierLayout';

export default function SupplierRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupplierLayout>{children}</SupplierLayout>
    </AuthProvider>
  );
}
