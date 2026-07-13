'use client';

import { CheckCircle, XCircle, QrCode, AlertTriangle } from 'lucide-react';
import type { BatchStatus } from './types';

interface BatchActionButtonsProps {
  status: BatchStatus;
  onComplete: () => void;
  onCancel: () => void;
  onFail?: () => void;
  onPrintQR: () => void;
}

export function BatchActionButtons({
  status,
  onComplete,
  onCancel,
  onFail,
  onPrintQR,
}: BatchActionButtonsProps) {
  const baseButtonClass = "flex items-center justify-center gap-2 flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap";

  // Aktif: Tandai Selesai + Batalkan + Gagal
  if (status === 'ACTIVE') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onComplete}
          className={`${baseButtonClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Selesai
        </button>
        <button
          onClick={onCancel}
          className={`${baseButtonClass} border border-red-300 text-red-600 hover:bg-red-50`}
        >
          <XCircle className="w-4 h-4 flex-shrink-0" />
          Batal
        </button>
        {onFail && (
          <button
            onClick={onFail}
            className={`${baseButtonClass} border border-orange-300 text-orange-600 hover:bg-orange-50`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Gagal
          </button>
        )}
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

  // Dibatalkan / Gagal: Tidak ada button
  return null;
}
