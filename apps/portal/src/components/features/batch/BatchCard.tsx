'use client';

import { Clock, School, AlertTriangle, Eye } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import type { BatchManagement } from './types';

interface BatchCardProps {
  batch: BatchManagement;
  onViewDetail: (batch: BatchManagement) => void;
}

function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end} WIB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return 'Hari ini';
  }

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function BatchCard({ batch, onViewDetail }: BatchCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800">{batch.batchNumber}</h3>
          <BatchStatusBadge status={batch.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            {formatDate(batch.deliveryDate)},{' '}
            {formatTimeRange(batch.deliveryTimeStart, batch.deliveryTimeEnd)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-semibold">
            {batch.reportKey}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 flex-1">
        {/* Target Distribusi */}
        <div className="flex items-start gap-2">
          <School className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            {batch.beneficiaryNames && batch.beneficiaryNames.length > 0 ? (
              <div className="space-y-0.5">
                {batch.beneficiaryNames.slice(0, 2).map((name, idx) => (
                  <p key={idx} className="text-sm font-medium text-gray-800">{name}</p>
                ))}
                {batch.beneficiaryNames.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{batch.beneficiaryNames.length - 2} lainnya
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-800">-</p>
            )}
            <p className="text-xs text-gray-500">{batch.beneficiaryPortions || batch.beneficiaryCount || 0} Porsi</p>
          </div>
        </div>

        {/* Nama Menu */}
        {batch.menu && (
          <p className="text-sm text-gray-700 font-medium">{batch.menu}</p>
        )}

        {/* Allergen */}
        {batch.allergens && batch.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {batch.allergens.map((a, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
              >
                <AlertTriangle className="w-3 h-3" />
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onViewDetail(batch)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] active:shadow-inner transition-all"
        >
          <Eye className="w-4 h-4" />
          Lihat Detail
        </button>
      </div>
    </div>
  );
}
