"use client";

import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import { SupplierStats } from "./types";

interface SupplierStatsCardsProps {
  stats: SupplierStats;
}

export function SupplierStatsCards({ stats }: SupplierStatsCardsProps) {
  return (
    <AdminStatsGrid columns={4}>
      <AdminStatsCard
        title="Menunggu"
        value={stats.pendingCount}
        unit="Pesanan"
        color="yellow"
        subtitle={stats.pendingCount > 0 ? "Perlu konfirmasi" : undefined}
      />
      <AdminStatsCard
        title="Dikonfirmasi"
        value={stats.confirmedCount}
        unit="Pesanan"
        color="blue"
        subtitle={stats.confirmedCount > 0 ? "Siap dikirim" : undefined}
      />
      <AdminStatsCard
        title="Dikirim"
        value={stats.deliveredCount}
        unit="Pesanan"
        color="green"
        subtitle={stats.deliveredCount > 0 ? "Dalam pengiriman" : undefined}
      />
      <AdminStatsCard
        title="Total Nilai Aktif"
        value={`Rp ${stats.totalActiveValue.toLocaleString("id-ID")}`}
        color="primary"
        accent
        subtitle={`${stats.completedCount} pesanan selesai`}
      />
    </AdminStatsGrid>
  );
}
