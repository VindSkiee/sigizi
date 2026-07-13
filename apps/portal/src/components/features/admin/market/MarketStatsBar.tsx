"use client";

import { MarketStats } from "./types";
import { formatCurrency } from "@/lib/utils";

interface MarketStatsBarProps {
  stats: MarketStats;
}

export function MarketStatsBar({ stats }: MarketStatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Supplier */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Total Supplier
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.total}
          <span className="text-sm font-normal text-gray-500 ml-1">toko</span>
        </p>
      </div>

      {/* Rata-rata Harga */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Rata-rata Harga
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.total > 0 ? formatCurrency(stats.avgPrice) : "-"}
        </p>
      </div>

      {/* Range Harga */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Range Harga
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.total > 0 ? (
            <>
              {formatCurrency(stats.minPrice)}
              <span className="text-sm font-normal text-gray-500 mx-1">-</span>
              {formatCurrency(stats.maxPrice)}
            </>
          ) : (
            "-"
          )}
        </p>
      </div>
    </div>
  );
}
