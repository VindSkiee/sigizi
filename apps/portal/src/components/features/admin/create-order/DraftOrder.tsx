"use client";

import { DraftItem } from "./types";
import { DraftItemRow } from "./DraftItemRow";

interface DraftOrderProps {
  items: DraftItem[];
  deliveryTime: string;
  onDeliveryTimeChange: (time: string) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DraftOrder({
  items,
  deliveryTime,
  onDeliveryTimeChange,
  onUpdateQuantity,
  onRemove,
  onSubmit,
  onCancel,
  isSubmitting,
}: DraftOrderProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm text-gray-500">Belum ada item dalam pesanan</p>
        <p className="text-xs text-gray-400 mt-1">Cari bahan baku dan pilih supplier untuk menambahkan ke pesanan</p>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-sm font-semibold text-green-800">
            Daftar Pesanan Anda (Draft)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Waktu Pengiriman:</label>
          <input
            type="datetime-local"
            value={deliveryTime}
            onChange={(e) => onDeliveryTimeChange(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Barang & Supplier Terpilih
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Harga Satuan
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Jumlah (Qty)
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <DraftItemRow
              key={`${item.supplierId}-${item.itemId}`}
              item={item}
              index={index}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Total Pesanan</span>
          <span className="text-lg font-bold text-gray-900">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || items.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Proses Pesanan (PO)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
