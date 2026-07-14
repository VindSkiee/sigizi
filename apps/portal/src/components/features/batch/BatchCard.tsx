'use client';

import { Clock, School, DollarSign } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import { BatchActionButtons } from './BatchActionButtons';
import type { BatchManagement } from './types';

interface BatchCardProps {
  batch: BatchManagement;
  onComplete: (batchId: string) => void;
  onCancel: (batchId: string) => void;
  onFail?: (batchId: string) => void;
  onPrintQR: (batch: BatchManagement) => void;
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

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function BatchCard({
  batch,
  onComplete,
  onCancel,
  onFail,
  onPrintQR,
}: BatchCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{batch.batchNumber}</h3>
          <BatchStatusBadge status={batch.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-5 h-5" />
          <span>
            {formatDate(batch.deliveryDate)},{' '}
            {formatTimeRange(batch.deliveryTimeStart, batch.deliveryTimeEnd)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Target Distribusi */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Target Distribusi
          </p>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-gray-800">
              {batch.beneficiaryName} ({batch.beneficiaryPortions} Porsi)
            </p>
          </div>
        </div>

        {/* Budget Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Anggaran
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Standar/Porsi</p>
              <p className="font-medium text-gray-800">{formatCurrency(batch.costPerPortionStandard)}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Budget</p>
              <p className="font-medium text-gray-800">{formatCurrency(batch.totalBudget)}</p>
            </div>
            {batch.totalCost !== undefined && (
              <>
                <div>
                  <p className="text-gray-500">Total Biaya</p>
                  <p className="font-medium text-gray-800">{formatCurrency(batch.totalCost)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Variance</p>
                  <p className={`font-medium ${(batch.budgetVariance || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(batch.budgetVariance || 0))}
                    {(batch.budgetVariance || 0) <= 0 ? ' (Under)' : ' (Over)'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Menu Makanan */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Menu Makanan ({batch.cycle})
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-1.5">
              {batch.menus.map((menu, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    {menu.name} ({menu.weight})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Failed Info */}
        {batch.status === 'FAILED' && batch.failedReason && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
              Alasan Kegagalan
            </p>
            <p className="text-sm text-red-600">{batch.failedReason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0">
        <BatchActionButtons
          status={batch.status}
          onComplete={() => onComplete(batch.id)}
          onCancel={() => onCancel(batch.id)}
          onFail={onFail ? () => onFail(batch.id) : undefined}
          onPrintQR={() => onPrintQR(batch)}
        />
      </div>
    </div>
  );
}
