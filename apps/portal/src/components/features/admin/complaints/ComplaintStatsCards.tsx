'use client';

import { AlertTriangle, Eye, CheckCircle, ClipboardList } from 'lucide-react';
import type { ComplaintStats } from './types';

interface ComplaintStatsCardsProps {
  stats: ComplaintStats;
}

export function ComplaintStatsCards({ stats }: ComplaintStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Menunggu Ditinjau */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Perlu Ditinjau
          </p>
        </div>
        <p className="text-2xl font-bold text-yellow-600">
          {stats.pendingCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Menunggu tindakan</p>
      </div>

      {/* Sedang Ditinjau */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Ditinjau
          </p>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {stats.reviewedCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Sedang diproses</p>
      </div>

      {/* Selesai */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Selesai
          </p>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {stats.resolvedCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Tuntas ditangani</p>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total
          </p>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Semua komplain</p>
      </div>
    </div>
  );
}
