'use client';

import { X, History, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { StockHistoryData } from './types';

interface HistoryModalProps {
  isOpen: boolean;
  data: StockHistoryData | null;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    SPOILAGE: 'Rusak',
    THEFT: 'Pencurian',
    DISCREPANCY: 'Selisih',
    CORRECTION: 'Koreksi',
    OTHER: 'Lainnya',
  };
  return labels[reason] || reason;
}

export function HistoryModal({ isOpen, data, onClose }: HistoryModalProps) {
  if (!isOpen || !data) return null;

  const { stock, adjustments } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Histori Stok</h2>
              <p className="text-xs text-gray-500">{stock.item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Stok Saat Ini</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stock.remainingQty} {stock.item.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stok Awal</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stock.initialQty} {stock.item.unit}
                </p>
              </div>
            </div>
          </div>

          {adjustments.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum ada riwayat penyesuaian</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {adjustments.map((adj) => {
                const isPositive = adj.adjustmentQty > 0;
                return (
                  <div key={adj.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{adj.adjustmentQty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {getReasonLabel(adj.reason)}
                        </span>
                      </div>
                      {adj.description && (
                        <p className="text-xs text-gray-500 mt-1">{adj.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">{adj.changedBy.name}</p>
                        <span className="text-xs text-gray-300">·</span>
                        <p className="text-xs text-gray-400">{formatDate(adj.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
