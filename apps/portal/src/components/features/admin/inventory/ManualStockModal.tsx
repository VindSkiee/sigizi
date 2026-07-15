'use client';

import { useState } from 'react';
import { X, Package, Loader2 } from 'lucide-react';

interface ManualStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    itemName: string;
    unit?: string;
    purchasePrice: number;
    quantity: number;
    notes?: string;
  }) => void;
}

export function ManualStockModal({ isOpen, onClose, onConfirm }: ManualStockModalProps) {
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!itemName.trim() || !purchasePrice || !quantity) return;
    setIsSubmitting(true);
    try {
      onConfirm({
        itemName: itemName.trim(),
        unit: unit.trim() || undefined,
        purchasePrice: Number(purchasePrice),
        quantity: Number(quantity),
        notes: notes.trim() || undefined,
      });
      setItemName('');
      setUnit('');
      setPurchasePrice('');
      setQuantity('');
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Stok Manual</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Bahan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="contoh: Beras Premium"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Satuan
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, liter, pcs"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jumlah Awal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Harga Beli per Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catatan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan opsional"
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
            disabled={!itemName.trim() || !purchasePrice || !quantity || isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            Simpan Stok
          </button>
        </div>
      </div>
    </div>
  );
}
