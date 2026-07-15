"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface RadiusWarningModalProps {
  isOpen: boolean;
  requested: number;
  effective: number;
  totalSupplier: number;
  filteredCount: number;
  onExpand: () => void;
  onFilter: () => void;
}

export function RadiusWarningModal({
  isOpen,
  requested,
  effective,
  totalSupplier,
  filteredCount,
  onExpand,
  onFilter,
}: RadiusWarningModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - no onClick, user must choose */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Radius Diperluas</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Hanya{" "}
              <span className="font-semibold text-gray-900">
                {filteredCount} supplier
              </span>{" "}
              ditemukan dalam radius{" "}
              <span className="font-semibold text-gray-900">
                {requested} km
              </span>
              .
            </p>
            <p>
              Sistem memperluas pencarian ke{" "}
              <span className="font-semibold text-gray-900">
                {effective} km
              </span>{" "}
              dan menemukan{" "}
              <span className="font-semibold text-gray-900">
                {totalSupplier} supplier
              </span>{" "}
              untuk data statistik yang cukup.
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Catatan:</span> Statistik harga
              pasar membutuhkan minimal 5 data supplier untuk hasil yang akurat.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onFilter}
              className="flex-1 px-4 py-3 text-sm font-medium text-amber-700 bg-white border-2 border-amber-300 rounded-xl hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
            >
              <div className="text-center">
                <span className="block">Tetap dalam {requested} km</span>
                <span className="text-xs text-amber-500 mt-0.5 block">
                  Hanya {filteredCount} data
                </span>
              </div>
            </button>
            <button
              onClick={onExpand}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              <div className="text-center">
                <span className="block">Tampilkan Semua</span>
                <span className="text-xs text-primary-200 mt-0.5 block">
                  {totalSupplier} data dalam {effective} km
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
