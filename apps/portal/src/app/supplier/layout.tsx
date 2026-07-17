import SupplierLayout from '@/components/layout/SupplierLayout';
import { PageErrorBoundary } from '@/components/features/PageErrorBoundary';
import { DemoNoticeModal } from '@/components/ui/DemoNoticeModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoNoticeModal />
      <SupplierLayout>
        <PageErrorBoundary pageName="Portal Supplier">{children}</PageErrorBoundary>
      </SupplierLayout>
    </>
  );
}
