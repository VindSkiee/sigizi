"use client";

import { Building2, Users, UtensilsCrossed } from "lucide-react";
import type { BeneficiaryStats } from "./types";

interface BeneficiaryStatsCardsProps {
  stats: BeneficiaryStats;
}

export function BeneficiaryStatsCards({ stats }: BeneficiaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Lembaga */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total Lembaga
          </p>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {stats.totalInstitutions}
        </p>
        <p className="text-xs text-gray-400 mt-1">Institusi Penerima</p>
      </div>

      {/* Total Penerima Manfaat */}
      <div className="bg-blue-900 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
            Total Penerima Manfaat
          </p>
        </div>
        <p className="text-3xl font-bold">
          {stats.totalBeneficiaries.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-blue-200 ml-1">
            Orang
          </span>
        </p>
        <p className="text-xs text-blue-300 mt-2">
          Seluruh lembaga terdaftar
        </p>
      </div>

      {/* Total Target Porsi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total Target Porsi
          </p>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {stats.totalPortions.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-gray-500 ml-1">Porsi</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Target per hari</p>
      </div>
    </div>
  );
}
