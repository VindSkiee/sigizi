"use client";

import { SupplierStats } from "./types";

interface SupplierStatsCardsProps {
  stats: SupplierStats;
}

export function SupplierStatsCards({ stats }: SupplierStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Pesanan Menunggu */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Menunggu
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.pendingCount}
          <span className="text-sm font-normal text-gray-500 ml-1">Pesanan</span>
        </p>
        {stats.pendingCount > 0 && (
          <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Perlu konfirmasi
          </p>
        )}
      </div>

      {/* Card 2: Dikonfirmasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Dikonfirmasi
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.confirmedCount}
          <span className="text-sm font-normal text-gray-500 ml-1">Pesanan</span>
        </p>
        {stats.confirmedCount > 0 && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
            Siap dikirim
          </p>
        )}
      </div>

      {/* Card 3: Dikirim */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Dikirim
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.deliveredCount}
          <span className="text-sm font-normal text-gray-500 ml-1">Pesanan</span>
        </p>
        {stats.deliveredCount > 0 && (
          <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
            Dalam pengiriman
          </p>
        )}
      </div>

      {/* Card 4: Total Nilai Aktif */}
      <div className="bg-primary-600 rounded-xl p-5 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-wide mb-1">
          Total Nilai Aktif
        </p>
        <p className="text-2xl font-bold">
          Rp {stats.totalActiveValue.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-primary-200 mt-2">
          {stats.completedCount} pesanan selesai
        </p>
      </div>
    </div>
  );
}
