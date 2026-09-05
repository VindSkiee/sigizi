"use client";

import { TrendingUp } from "lucide-react";

interface ReportHeaderProps {
  onOpenBgnModal?: () => void;
}

export function ReportHeader({ onOpenBgnModal }: ReportHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Laporan Keuangan
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Kelola pengeluaran operasional dan lihat referensi harga pasar.
          Data pembelian dari supplier akan otomatis tercatat setelah pesanan selesai.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">Marketplace Active</span>
        </div>
      </div>
    </div>
  );
}
