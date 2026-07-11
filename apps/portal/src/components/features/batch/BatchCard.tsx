'use client';

import { Clock, School, Trash2 } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import { BatchActionButtons } from './BatchActionButtons';
import type { BatchManagement } from './types';

interface BatchCardProps {
  batch: BatchManagement;
  onComplete: (batchId: string) => void;
  onCancel: (batchId: string) => void;
  onPrintQR: (batch: BatchManagement) => void;
  onDelete: (batchId: string) => void;
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

export function BatchCard({
  batch,
  onComplete,
  onCancel,
  onPrintQR,
  onDelete,
}: BatchCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{batch.batchNumber}</h3>
          <div className="flex items-center gap-2">
            <BatchStatusBadge status={batch.status} />
            <button
              onClick={() => onDelete(batch.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus batch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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
      </div>

      {/* Actions */}
      <div className="p-6 pt-0">
        <BatchActionButtons
          status={batch.status}
          onComplete={() => onComplete(batch.id)}
          onCancel={() => onCancel(batch.id)}
          onPrintQR={() => onPrintQR(batch)}
        />
      </div>
    </div>
  );
}
