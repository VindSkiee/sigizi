"use client";

import { AlertTriangle, Eye, CheckCircle, ClipboardList } from "lucide-react";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import type { ComplaintStats } from "./types";

interface ComplaintStatsCardsProps {
  stats: ComplaintStats;
}

export function ComplaintStatsCards({ stats }: ComplaintStatsCardsProps) {
  return (
    <AdminStatsGrid columns={4}>
      <AdminStatsCard
        title="Perlu Ditinjau"
        value={stats.pendingCount}
        icon={<AlertTriangle className="w-5 h-5" />}
        color="yellow"
        subtitle="Menunggu tindakan"
      />
      <AdminStatsCard
        title="Ditinjau"
        value={stats.reviewedCount}
        icon={<Eye className="w-5 h-5" />}
        color="blue"
        subtitle="Sedang diproses"
      />
      <AdminStatsCard
        title="Selesai"
        value={stats.resolvedCount}
        icon={<CheckCircle className="w-5 h-5" />}
        color="green"
        subtitle="Tuntas ditangani"
      />
      <AdminStatsCard
        title="Total"
        value={stats.totalCount}
        icon={<ClipboardList className="w-5 h-5" />}
        color="gray"
        subtitle="Semua komplain"
      />
    </AdminStatsGrid>
  );
}
