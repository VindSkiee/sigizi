import { Store, ShoppingCart, Wallet } from "lucide-react";
import {
  AdminStatsCard,
  AdminStatsGrid,
} from "@/components/ui/AdminStatsCard";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "./types";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function DashboardStatsCards({ stats, loading }: DashboardStatsCardsProps) {
  return (
    <AdminStatsGrid columns={3}>
      <AdminStatsCard
        title="Total Supplier"
        value={stats.totalSuppliers}
        unit=" supplier"
        icon={<Store className="h-5 w-5" />}
        color="blue"
        loading={loading}
      />
      <AdminStatsCard
        title="Total Pesanan"
        value={stats.totalOrders}
        unit=" pesanan"
        icon={<ShoppingCart className="h-5 w-5" />}
        color="green"
        loading={loading}
      />
      <AdminStatsCard
        title="Total Pengeluaran"
        value={formatCurrency(stats.totalSpend)}
        icon={<Wallet className="h-5 w-5" />}
        color="orange"
        loading={loading}
      />
    </AdminStatsGrid>
  );
}
