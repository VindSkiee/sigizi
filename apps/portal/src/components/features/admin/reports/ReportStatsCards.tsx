"use client";

import { ReportStats, ExpenseSource, SOURCE_LABELS } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import { Wallet, Receipt, Tag } from "lucide-react";

interface ReportStatsCardsProps {
  stats: ReportStats;
  activeSource: ExpenseSource;
}

export function ReportStatsCards({
  stats,
  activeSource,
}: ReportStatsCardsProps) {
  return (
    <AdminStatsGrid columns={3} className="mb-4">
      <AdminStatsCard
        title="Total Pengeluaran Operasional"
        value={formatCurrency(stats.totalOpex)}
        icon={<Wallet className="w-5 h-5" />}
        color="orange"
        accent
        subtitle={`${stats.opexCount} transaksi tercatat`}
        className="p-3"
      />
      <AdminStatsCard
        title="Jumlah Transaksi"
        value={stats.opexCount}
        icon={<Receipt className="w-5 h-5" />}
        color="blue"
        subtitle="Pengeluaran tercatat"
        className="p-3"
      />
      <AdminStatsCard
        title="Kategori Terbanyak"
        value={stats.topCategory || "-"}
        icon={<Tag className="w-5 h-5" />}
        color="gray"
        subtitle="Kategori pengeluaran terbesar"
        className="p-3"
      />
    </AdminStatsGrid>
  );
}
