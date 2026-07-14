import SupplierLayout from '@/components/layout/SupplierLayout';
import { PageErrorBoundary } from '@/components/features/PageErrorBoundary';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SupplierLayout>
      <PageErrorBoundary pageName="Portal Supplier">{children}</PageErrorBoundary>
    </SupplierLayout>
  );
}
