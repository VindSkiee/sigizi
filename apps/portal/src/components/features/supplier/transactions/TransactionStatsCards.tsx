import { ShoppingCart, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  AdminStatsCard,
  AdminStatsGrid,
} from "@/components/ui/AdminStatsCard";
import type { Transaction } from "./types";

interface TransactionStatsCardsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionStatsCards({
  transactions,
  loading,
}: TransactionStatsCardsProps) {
  const total = transactions.length;
  const completedCount = transactions.filter(
    (t) => t.status === "COMPLETED",
  ).length;
  const activeCount = transactions.filter(
    (t) => t.status === "PENDING" || t.status === "CONFIRMED" || t.status === "DELIVERED",
  ).length;
  const cancelledCount = transactions.filter(
    (t) => t.status === "CANCELLED",
  ).length;

  return (
    <AdminStatsGrid columns={4}>
      <AdminStatsCard
        title="Total Transaksi"
        value={total}
        icon={<ShoppingCart className="h-5 w-5" />}
        color="blue"
        loading={loading}
      />
      <AdminStatsCard
        title="Selesai"
        value={completedCount}
        icon={<CheckCircle className="h-5 w-5" />}
        color="green"
        loading={loading}
      />
      <AdminStatsCard
        title="Dalam Proses"
        value={activeCount}
        icon={<Clock className="h-5 w-5" />}
        color="yellow"
        loading={loading}
      />
      <AdminStatsCard
        title="Dibatalkan"
        value={cancelledCount}
        icon={<XCircle className="h-5 w-5" />}
        color="red"
        loading={loading}
      />
    </AdminStatsGrid>
  );
}
