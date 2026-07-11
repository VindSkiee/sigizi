<<<<<<< HEAD
import SupplierLayout from '@/components/layout/SupplierLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SupplierLayout>{children}</SupplierLayout>;
}
=======
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
>>>>>>> 0c43e458f302d0cd994ec736cd6a7fa41784aecf
