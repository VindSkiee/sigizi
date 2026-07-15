"use client";

import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import type { InventoryValuation } from "./types";

interface InventoryStatsCardsProps {
  valuation: InventoryValuation | null;
  lowStockCount: number;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function InventoryStatsCards({
  valuation,
  lowStockCount,
}: InventoryStatsCardsProps) {
  const isLoading = !valuation;
  const totalItem = valuation?.items.length ?? 0;

  return (
    <AdminStatsGrid columns={3}>
      <AdminStatsCard
        title="Total Nilai"
        value={isLoading ? "-" : formatCurrency(valuation.totalValue)}
        icon={<DollarSign className="w-5 h-5" />}
        color="green"
        subtitle="Nilai inventaris saat ini"
        loading={isLoading}
      />
      <AdminStatsCard
        title="Total Item"
        value={totalItem}
        icon={<Package className="w-5 h-5" />}
        color="blue"
        subtitle="Jenis item aktif"
        loading={isLoading}
      />
      <AdminStatsCard
        title="Stok Menipis"
        value={lowStockCount}
        icon={<AlertTriangle className="w-5 h-5" />}
        color="orange"
        subtitle="Item perlu restock"
        loading={isLoading}
      />
    </AdminStatsGrid>
  );
}
