"use client";

import { ReportStats } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";

interface ReportStatsCardsProps {
  stats: ReportStats;
}

export function ReportStatsCards({ stats }: ReportStatsCardsProps) {
  return (
    <AdminStatsGrid columns={3} className="mb-4">
      <AdminStatsCard
        title="Total Pengeluaran (Auto-Sync)"
        value={formatCurrency(stats.totalPengeluaran)}
        color="primary"
        accent
        subtitle={`${stats.invoiceCount} Invoice / PO selesai`}
        className="p-3"
      />
      <AdminStatsCard
        title="Total Porsi Terkirim"
        value={stats.totalPorsi.toLocaleString("id-ID")}
        unit="Porsi"
        color="green"
        subtitle="Scan batch harian"
        className="p-3"
      />
      <AdminStatsCard
        title="Laporan Tambahan"
        value={formatCurrency(stats.totalTambahan)}
        color="orange"
        subtitle="Biaya operasional"
        className="p-3"
      />
    </AdminStatsGrid>
  );
}
