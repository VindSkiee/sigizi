import { CheckCircle, Clock, XCircle } from "lucide-react";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import { formatCurrency } from "@/lib/utils";
import { getDisplayStatus, type Transaction } from "./types";

interface TransactionStatsCardsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionStatsCards({
  transactions,
  loading,
}: TransactionStatsCardsProps) {
  const dibayarCount = transactions.filter(
    (t) => getDisplayStatus(t.status, t.paidAt) === "DIBAYAR",
  ).length;
  const belumBayarCount = transactions.filter(
    (t) => getDisplayStatus(t.status, t.paidAt) === "BELUM_BAYAR",
  ).length;
  const dibatalkanCount = transactions.filter(
    (t) => getDisplayStatus(t.status, t.paidAt) === "CANCELLED",
  ).length;

  return (
    <AdminStatsGrid columns={3}>
      <AdminStatsCard
        title="Dibayar"
        value={dibayarCount}
        icon={<CheckCircle className="h-5 w-5" />}
        color="green"
        loading={loading}
      />
      <AdminStatsCard
        title="Belum Bayar"
        value={belumBayarCount}
        icon={<Clock className="h-5 w-5" />}
        color="yellow"
        loading={loading}
      />
      <AdminStatsCard
        title="Dibatalkan"
        value={dibatalkanCount}
        icon={<XCircle className="h-5 w-5" />}
        color="red"
        loading={loading}
      />
    </AdminStatsGrid>
  );
}
