'use client';

import { Clock, School, DollarSign, Package, AlertTriangle } from 'lucide-react';
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
          <div className="flex items-start gap-2">
            <School className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              {batch.beneficiaryNames && batch.beneficiaryNames.length > 0 ? (
                <div className="space-y-0.5">
                  {batch.beneficiaryNames.map((name, idx) => (
                    <p key={idx} className="text-sm font-semibold text-gray-800">{name}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-800">-</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{batch.beneficiaryPortions || batch.beneficiaryCount || 0} Porsi</p>
            </div>
          </div>
        </div>

        {/* Nama Menu */}
        {batch.menu && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Nama Menu
            </p>
            <p className="text-sm font-semibold text-gray-800">{batch.menu}</p>
          </div>
        )}

        {/* Allergen */}
        {batch.allergens && batch.allergens.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Allergen
            </p>
            <div className="flex flex-wrap gap-1.5">
              {batch.allergens.map((a, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bahan Baku */}
        {batch.batchItems && batch.batchItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bahan Baku
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-1.5">
                {batch.batchItems.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{item.name}</span>
                    </span>
                    <span className="text-gray-500">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
            {batch.totalCost !== undefined && batch.totalCost > 0 && (
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
            {batch.costPerPortion !== undefined && batch.costPerPortion > 0 && (
              <div className="col-span-2">
                <p className="text-gray-500">Biaya/Porsi (Aktual)</p>
                <p className="font-medium text-gray-800">{formatCurrency(batch.costPerPortion)}</p>
              </div>
            )}
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
