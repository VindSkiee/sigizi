<<<<<<< HEAD
'use client';

import { Package, Truck, ClipboardList, FileText } from 'lucide-react';
import { StatsCard } from '@/components/features/supplier/StatsCard';
import { MaterialSection } from '@/components/features/supplier/MaterialSection';
import { NetworkSection } from '@/components/features/supplier/NetworkSection';
import { ShipmentChart } from '@/components/features/supplier/ShipmentChart';

export default function SupplierDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div> 
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan aktivitas operasional Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Produk"
          value={156}
          icon={<Package className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pengiriman Berhasil"
          value={12}
          icon={<Truck className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pesanan Masuk"
          value={4}
          icon={<ClipboardList className="w-6 h-6" />}
        />
        <StatsCard
          title="MoU Aktif"
          value={3}
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      {/* Material + Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaterialSection />
        <NetworkSection />
      </div>

      {/* Shipment Chart */}
      <ShipmentChart />
    </div>
  );
}
=======
'use client';

import { Package, Truck, ClipboardList, FileText } from 'lucide-react';
import { StatsCard } from '@/components/features/supplier/StatsCard';
import { MoUSection } from '@/components/features/supplier/MoUSection';
import { MaterialSection } from '@/components/features/supplier/MaterialSection';
import { NetworkSection } from '@/components/features/supplier/NetworkSection';
import { ShipmentChart } from '@/components/features/supplier/ShipmentChart';

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
          icon={<Package className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pengiriman Berhasil"
          value={12}
          icon={<Truck className="w-6 h-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pesanan Masuk"
          value={4}
          icon={<ClipboardList className="w-6 h-6" />}
        />
        <StatsCard
          title="MoU Aktif"
          value={3}
          icon={<FileText className="w-6 h-6" />}
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
>>>>>>> 0c43e458f302d0cd994ec736cd6a7fa41784aecf
