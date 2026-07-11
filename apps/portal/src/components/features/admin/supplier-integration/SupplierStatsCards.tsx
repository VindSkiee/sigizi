"use client";

import { SupplierStats } from "./types";

interface SupplierStatsCardsProps {
  stats: SupplierStats;
}

export function SupplierStatsCards({ stats }: SupplierStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Pesanan Menunggu */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Pesanan Menunggu
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {stats.pendingCount}
          <span className="text-sm font-normal text-gray-500 ml-1">Pesanan</span>
        </p>
        {stats.pendingCount > 0 && (
          <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
            Menunggu konfirmasi dari supplier
          </p>
        )}
      </div>

      {/* Card 2: Dikirim */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Dikirim
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {stats.deliveredCount}
          <span className="text-sm font-normal text-gray-500 ml-1">Pesanan</span>
        </p>
        {stats.deliveredCount > 0 && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            Pesanan dalam pengiriman
          </p>
        )}
      </div>

      {/* Card 3: Total Nilai Aktif */}
      <div className="bg-blue-600 rounded-xl p-6 text-white">
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
          Total Nilai Pesanan Aktif
        </p>
        <p className="text-3xl font-bold">
          Rp {stats.totalActiveValue.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-blue-200 mt-2">
          {stats.completedCount} pesanan sudah selesai
        </p>
      </div>
    </div>
  );
}
