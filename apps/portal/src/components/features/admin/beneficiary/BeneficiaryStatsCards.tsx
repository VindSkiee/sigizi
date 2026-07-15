"use client";

import { Building2, Users, UtensilsCrossed } from "lucide-react";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import type { BeneficiaryStats } from "./types";

interface BeneficiaryStatsCardsProps {
  stats: BeneficiaryStats;
}

export function BeneficiaryStatsCards({ stats }: BeneficiaryStatsCardsProps) {
  return (
    <AdminStatsGrid columns={3}>
      <AdminStatsCard
        title="Total Lembaga"
        value={stats.totalInstitutions}
        icon={<Building2 className="w-5 h-5" />}
        color="blue"
        subtitle="Institusi Penerima"
      />
      <AdminStatsCard
        title="Total Penerima Manfaat"
        value={stats.totalBeneficiaries.toLocaleString("id-ID")}
        unit="Orang"
        icon={<Users className="w-5 h-5" />}
        color="primary"
        accent
        subtitle="Seluruh lembaga terdaftar"
      />
      <AdminStatsCard
        title="Total Target Porsi"
        value={stats.totalPortions.toLocaleString("id-ID")}
        unit="Porsi"
        icon={<UtensilsCrossed className="w-5 h-5" />}
        color="green"
        subtitle="Target per hari"
      />
    </AdminStatsGrid>
  );
}
