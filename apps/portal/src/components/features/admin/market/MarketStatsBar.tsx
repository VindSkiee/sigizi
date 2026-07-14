"use client";

import { MarketPriceStatistics } from "./types";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

interface MarketStatsBarProps {
  rawStats: MarketPriceStatistics;
  cleanStats: MarketPriceStatistics;
  item: string;
}

export function MarketStatsBar({
  rawStats,
  cleanStats,
  item,
}: MarketStatsBarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Raw Stats (All Data) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            Data Mentah ({rawStats.count} supplier)
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Harga Minimum</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(rawStats.min)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Harga Maksimum</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(rawStats.max)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Rata-rata</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(rawStats.mean)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Median</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(rawStats.median)}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Stats (IQR Filtered) */}
      <div className="bg-blue-900 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-semibold text-blue-100">
            Harga Bersih / HET ({cleanStats.count} supplier)
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-300 mb-0.5">Harga Minimum</p>
            <p className="text-lg font-bold text-green-300">
              {formatCurrency(cleanStats.min)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-300 mb-0.5">Harga Maksimum</p>
            <p className="text-lg font-bold text-red-300">
              {formatCurrency(cleanStats.max)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-300 mb-0.5">Rata-rata</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(cleanStats.mean)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-300 mb-0.5">Median</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(cleanStats.median)}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-800">
          <p className="text-xs text-blue-300">
            Harga yang ditampilkan sudah difilter dari data anomali menggunakan metode IQR.
          </p>
        </div>
      </div>
    </div>
  );
}
