"use client";

import { ReportStats } from "./types";
import { formatCurrency } from "@/lib/utils";

interface ReportStatsCardsProps {
  stats: ReportStats;
}

export function ReportStatsCards({ stats }: ReportStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Pengeluaran */}
      <div className="bg-blue-900 rounded-xl p-5 text-white">
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
          Total Pengeluaran (Auto-Sync Supplier)
        </p>
        <p className="text-2xl font-bold">{formatCurrency(stats.totalPengeluaran)}</p>
        <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Dari {stats.invoiceCount} Invoice / PO selesai
        </p>
      </div>

      {/* Total Porsi */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Total Porsi Terkirim
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalPorsi.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-gray-500 ml-1">Porsi</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">Tercatat dari scan batch harian</p>
      </div>

      {/* Input Tambahan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Input Laporan Tambahan
        </p>
        <p className="text-2xl font-bold text-orange-500">
          {formatCurrency(stats.totalTambahan)}
        </p>
        <p className="text-xs text-gray-500 mt-2">Biaya operasional / gas dapur</p>
      </div>
    </div>
  );
}
