"use client";

import { MarketPriceStatistics } from "./types";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, BarChart3, Target } from "lucide-react";

interface MarketStatsBarProps {
  rawStats: MarketPriceStatistics;
  cleanStats: MarketPriceStatistics;
  item: string;
  onUseAsReference?: (dataSource: "clean" | "raw") => void;
}

export function MarketStatsBar({
  rawStats,
  cleanStats,
  item,
  onUseAsReference,
}: MarketStatsBarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Raw Stats (All Data) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
        <div className="flex-1">
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
        {onUseAsReference && (
          <div className="mt-auto pt-4">
            <button
              onClick={() => onUseAsReference("raw")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              Gunakan sebagai acuan
            </button>
          </div>
        )}
      </div>

      {/* Clean Stats (IQR Filtered) */}
      <div className="bg-blue-900 rounded-xl p-5 text-white flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-300" />
            <h3 className="text-sm font-semibold text-blue-100">
              Data Bersih ({cleanStats.count} supplier)
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
              Harga yang ditampilkan sudah difilter dari data anomali
              menggunakan metode IQR.
            </p>
          </div>
        </div>
        {onUseAsReference && (
          <div className="mt-auto pt-4">
            <button
              onClick={() => onUseAsReference("clean")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-600 border border-emerald-500 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              Gunakan sebagai acuan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
