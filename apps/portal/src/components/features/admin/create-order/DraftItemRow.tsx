"use client";

import { DraftItem } from "./types";

interface DraftItemRowProps {
  item: DraftItem;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  index: number;
}

export function DraftItemRow({ item, onUpdateQuantity, onRemove, index }: DraftItemRowProps) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      {/* Barang & Supplier Terpilih */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{item.itemName}</p>
          <p className="text-xs text-gray-500">{item.supplierName}</p>
        </div>
      </td>

      {/* Harga Satuan */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-700">
          Rp {item.unitPrice.toLocaleString("id-ID")}
          <span className="text-gray-500 ml-1">/ {item.unit}</span>
        </p>
      </td>

      {/* Jumlah (Qty) */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
          />
          <span className="text-sm text-gray-500">{item.unit}</span>
        </div>
      </td>

      {/* Aksi */}
      <td className="px-4 py-4">
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
