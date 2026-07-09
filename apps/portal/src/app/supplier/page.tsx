'use client';

import { StatsCard } from '@/components/features/supplier/StatsCard';
import { MoUSection } from '@/components/features/supplier/MoUSection';
import { MaterialSection } from '@/components/features/supplier/MaterialSection';
import { NetworkSection } from '@/components/features/supplier/NetworkSection';
import { ShipmentChart } from '@/components/features/supplier/ShipmentChart';

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function SupplierDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan aktivitas operasional Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Produk"
          value={156}
          icon={<PackageIcon className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pengiriman Berhasil"
          value={12}
          icon={<TruckIcon className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pesanan Masuk"
          value={4}
          icon={<ClipboardIcon className="w-6 h-6" />}
        />
        <StatsCard
          title="MoU Aktif"
          value={3}
          icon={<FileTextIcon className="w-6 h-6" />}
        />
      </div>

      {/* MoU Section */}
      <MoUSection />

      {/* Material + Network + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MaterialSection />
        </div>
        <div>
          <NetworkSection />
        </div>
      </div>

      {/* Shipment Chart */}
      <ShipmentChart />
    </div>
  );
}
