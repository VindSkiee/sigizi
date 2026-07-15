"use client";

import { ReportStats } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";

interface ReportStatsCardsProps {
  stats: ReportStats;
}

export function ReportStatsCards({ stats }: ReportStatsCardsProps) {
  return (
    <AdminStatsGrid columns={3}>
      <AdminStatsCard
        title="Total Pengeluaran (Auto-Sync Supplier)"
        value={formatCurrency(stats.totalPengeluaran)}
        color="primary"
        accent
        subtitle={`Dari ${stats.invoiceCount} Invoice / PO selesai`}
      />
      <AdminStatsCard
        title="Total Porsi Terkirim"
        value={stats.totalPorsi.toLocaleString("id-ID")}
        unit="Porsi"
        color="green"
        subtitle="Tercatat dari scan batch harian"
      />
      <AdminStatsCard
        title="Input Laporan Tambahan"
        value={formatCurrency(stats.totalTambahan)}
        color="orange"
        subtitle="Biaya operasional / gas dapur"
      />
    </AdminStatsGrid>
  );
}
