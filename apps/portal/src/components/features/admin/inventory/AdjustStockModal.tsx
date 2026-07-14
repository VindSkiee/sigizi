'use client';

import { useState } from 'react';
import { X, Sliders, Loader2 } from 'lucide-react';
import type { InventoryStock } from './types';

interface AdjustStockModalProps {
  isOpen: boolean;
  stock: InventoryStock | null;
  onClose: () => void;
  onConfirm: (stockId: string, data: { adjustmentQty: number; reason: string; description?: string }) => void;
}

export function AdjustStockModal({ isOpen, stock, onClose, onConfirm }: AdjustStockModalProps) {
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stock || !adjustmentQty || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      onConfirm(stock.id, {
        adjustmentQty: Number(adjustmentQty),
        reason: reason.trim(),
        description: description.trim() || undefined,
      });
      setAdjustmentQty('');
      setReason('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <Sliders className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Adjust Stok</h2>
              <p className="text-xs text-gray-500">{stock.item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Stok Saat Ini</p>
            <p className="text-lg font-bold text-gray-900">
              {stock.remainingQty} {stock.item.unit}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jumlah Adjustment <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-1.5">
              Gunakan angka negatif untuk pengurangan, positif untuk penambahan
            </p>
            <input
              type="number"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(e.target.value)}
              placeholder="Contoh: -10 atau 5"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {adjustmentQty && (
              <p className="text-xs text-gray-500 mt-1">
                Stok baru: <span className="font-medium">{stock.remainingQty + Number(adjustmentQty)}</span> {stock.item.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alasan <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih alasan</option>
              <option value="SPOILAGE">Rusak / Spoilage</option>
              <option value="THEFT">Pencurian / Theft</option>
              <option value="DISCREPANCY">Selisih / Discrepancy</option>
              <option value="CORRECTION">Koreksi Stok</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keterangan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan detail (opsional)"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!adjustmentQty || !reason.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
            Simpan Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}
