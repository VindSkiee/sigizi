'use client';

import { Package, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import type { InventoryValuation } from './types';

interface InventoryStatsCardsProps {
  valuation: InventoryValuation | null;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function InventoryStatsCards({ valuation }: InventoryStatsCardsProps) {
  if (!valuation) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Nilai Inventaris */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total Nilai
          </p>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(valuation.totalValue)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Nilai inventaris saat ini</p>
      </div>

      {/* Total Item */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Total Item
          </p>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {valuation.totalItems}
        </p>
        <p className="text-xs text-gray-400 mt-1">Item aktif</p>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Stok Menipis
          </p>
        </div>
        <p className="text-2xl font-bold text-orange-600">
          {valuation.lowStockCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Item perlu restock</p>
      </div>

      {/* Expiring Soon */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Akan Kadaluarsa
          </p>
        </div>
        <p className="text-2xl font-bold text-red-600">
          {valuation.expiringSoonCount}
        </p>
        <p className="text-xs text-gray-400 mt-1">Dalam 7 hari ke depan</p>
      </div>
    </div>
  );
}
