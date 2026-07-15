"use client";

import {
  Package,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import type { BatchManagement } from "./types";

interface BatchStatsCardsProps {
  batches: BatchManagement[];
}

export function BatchStatsCards({ batches }: BatchStatsCardsProps) {
  const totalBatch = batches.length;
  const aktif = batches.filter((b) => b.status === "ACTIVE").length;
  const selesai = batches.filter((b) => b.status === "COMPLETED").length;
  const dibatalkan = batches.filter((b) => b.status === "CANCELLED").length;
  const gagal = batches.filter((b) => b.status === "FAILED").length;

  return (
    <AdminStatsGrid columns={4}>
      <AdminStatsCard
        title="Total Batch"
        value={totalBatch}
        icon={<Package className="w-5 h-5" />}
        color="blue"
      />
      <AdminStatsCard
        title="Aktif"
        value={aktif}
        icon={<ChefHat className="w-5 h-5" />}
        color="yellow"
      />
      <AdminStatsCard
        title="Selesai"
        value={selesai}
        icon={<CheckCircle className="w-5 h-5" />}
        color="green"
      />
      <AdminStatsCard
        title="Gagal / Batal"
        value={dibatalkan + gagal}
        icon={
          gagal > 0 ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )
        }
        color="red"
      />
    </AdminStatsGrid>
  );
}
