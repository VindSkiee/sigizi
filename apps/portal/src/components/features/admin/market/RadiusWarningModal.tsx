"use client";

import { useEffect } from "react";
import { Radar, MapPin } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Elegant Backdrop with Blur */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-white rounded-[24px] shadow-[0_24px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Minimalist Icon */}
        <div className="w-12 h-12 bg-blue-50/70 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
          <Radar className="w-6 h-6 text-blue-600 stroke-[1.5]" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-3">
          Radius Area Diperluas
        </h2>

        {/* Unified, Readable Content */}
        <div className="text-[15px] text-gray-500 leading-relaxed mb-8">
          <p>
            Hanya ditemukan <span className="font-medium text-gray-900">{filteredCount} supplier</span> dalam radius {requested} km. 
          </p>
          <p className="mt-2">
            Sistem secara otomatis memperluas area ke <span className="font-medium text-gray-900">{effective} km</span> ({totalSupplier} supplier) untuk memenuhi standar minimum data agar statistik harga pasar tetap akurat.
          </p>
        </div>

        {/* Action Buttons - Stacked for elegant reading hierarchy */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onExpand}
            className="w-full inline-flex items-center justify-between px-5 py-3.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100 group"
          >
            <span>Tampilkan Semua Data</span>
            <span className="text-blue-200 bg-blue-700/50 px-2 py-0.5 rounded-md text-xs group-hover:bg-blue-800/50 transition-colors">
              {totalSupplier} supplier
            </span>
          </button>
          
          <button
            onClick={onFilter}
            className="w-full inline-flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-50 group"
          >
            <span>Tetap di {requested} km</span>
            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md text-xs group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">
              {filteredCount} supplier
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}