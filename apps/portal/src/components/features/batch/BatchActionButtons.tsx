'use client';

import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import type { BatchStatus } from './types';

interface BatchActionButtonsProps {
  status: BatchStatus;
  onComplete: () => void;
  onCancel: () => void;
  onPrintQR: () => void;
}

export function BatchActionButtons({
  status,
  onComplete,
  onCancel,
  onPrintQR,
}: BatchActionButtonsProps) {
  const baseButtonClass = "flex items-center justify-center gap-2 flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap";

  // Aktif: Tandai Selesai + Batalkan
  if (status === 'ACTIVE') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onComplete}
          className={`${baseButtonClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Tandai Selesai
        </button>
        <button
          onClick={onCancel}
          className={`${baseButtonClass} border border-red-300 text-red-600 hover:bg-red-50`}
        >
          <XCircle className="w-4 h-4 flex-shrink-0" />
          Batalkan
        </button>
      </div>
    );
  }

  // Selesai: Cetak QR only
  if (status === 'COMPLETED') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onPrintQR}
          className={`${baseButtonClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <QrCode className="w-4 h-4 flex-shrink-0" />
          Cetak QR Porsi
        </button>
      </div>
    );
  }

  // Dibatalkan: Tidak ada button
  return null;
}
