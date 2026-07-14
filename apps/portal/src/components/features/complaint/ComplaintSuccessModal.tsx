"use client";

import { CheckCircle } from "lucide-react";

interface ComplaintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintSuccessModal({
  isOpen,
  onClose,
}: ComplaintSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Laporan Terkirim!
        </h2>
        <p className="text-sm text-gray-500 mb-2">
          Laporan Anda telah diterima.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Tim kami akan menindaklanjuti.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-6">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-amber-700">
            Status: PENDING
          </span>
        </div>

        <div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
