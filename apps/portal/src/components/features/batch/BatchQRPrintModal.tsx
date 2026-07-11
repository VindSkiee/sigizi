'use client';

import { X, QrCode, Printer } from 'lucide-react';
import type { BatchManagement } from './types';

interface BatchQRPrintModalProps {
  isOpen: boolean;
  batch: BatchManagement | null;
  onClose: () => void;
}

export function BatchQRPrintModal({ isOpen, batch, onClose }: BatchQRPrintModalProps) {
  if (!isOpen || !batch) return null;

  // Placeholder QR code - will be replaced with real QR generation later
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            QR Code Porsi
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
                <p className="text-xs text-gray-400">{batch.batchNumber}</p>
              </div>
            </div>

            {/* Batch Info */}
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-800">{batch.batchNumber}</p>
              <p className="text-sm text-gray-500">{batch.beneficiaryName}</p>
              <p className="text-sm text-gray-500">
                {batch.beneficiaryPortions} Porsi
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak QR
          </button>
        </div>
      </div>
    </div>
  );
}
