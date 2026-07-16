"use client";

import { ReportStats, ExpenseSource, SOURCE_LABELS } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";

interface ReportStatsCardsProps {
  stats: ReportStats;
  activeSource: ExpenseSource;
}

export function ReportStatsCards({
  stats,
  activeSource,
}: ReportStatsCardsProps) {
  if (activeSource === "PRODUCTION") {
    return (
      <AdminStatsGrid columns={3} className="mb-4">
        <AdminStatsCard
          title="Total Biaya Produksi"
          value={formatCurrency(stats.totalCogs)}
          color="green"
          accent
          subtitle="Biaya bahan batch"
          className="p-3"
        />
        <AdminStatsCard
          title="Total Porsi Terkirim"
          value={stats.totalPorsi.toLocaleString("id-ID")}
          unit="Porsi"
          color="primary"
          subtitle="Dari semua batch"
          className="p-3"
        />
        <AdminStatsCard
          title="Biaya per Porsi"
          value={
            stats.totalPorsi > 0
              ? formatCurrency(Math.round(stats.totalCogs / stats.totalPorsi))
              : "-"
          }
          color="gray"
          subtitle="Rata-rata biaya/porsi"
          className="p-3"
        />
      </AdminStatsGrid>
    );
  }

  if (activeSource === "CASH") {
    return (
      <AdminStatsGrid columns={3} className="mb-4">
        <AdminStatsCard
          title="Total Pengeluaran"
          value={formatCurrency(stats.totalProcured + stats.totalOpex)}
          color="primary"
          accent
          subtitle={`${stats.invoiceCount} transaksi`}
          className="p-3"
        />
        <AdminStatsCard
          title="Pembayaran Pesanan"
          value={formatCurrency(stats.totalProcured)}
          color="blue"
          subtitle="Order COMPLETED"
          className="p-3"
        />
        <AdminStatsCard
          title="Biaya Operasional"
          value={formatCurrency(stats.totalOpex)}
          color="orange"
          subtitle="Transport, utilitas, dll"
          className="p-3"
        />
      </AdminStatsGrid>
    );
  }

  return (
    <AdminStatsGrid columns={4} className="mb-4">
      <AdminStatsCard
        title="Total Keseluruhan"
        value={formatCurrency(
          stats.totalCogs + stats.totalProcured + stats.totalOpex,
        )}
        color="primary"
        accent
        subtitle="Semua sumber"
        className="p-3"
      />
      <AdminStatsCard
        title="Pesanan (Procurement)"
        value={formatCurrency(stats.totalProcured)}
        color="blue"
        subtitle="Pembayaran supplier"
        className="p-3"
      />
      <AdminStatsCard
        title="Produksi (COGS)"
        value={formatCurrency(stats.totalCogs)}
        color="green"
        subtitle="Biaya bahan batch"
        className="p-3"
      />
      <AdminStatsCard
        title="Operasional (OPEX)"
        value={formatCurrency(stats.totalOpex)}
        color="orange"
        subtitle="Biaya operasional"
        className="p-3"
      />
    </AdminStatsGrid>
  );
}
