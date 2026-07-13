"use client";

import { SupplierSearchResult } from "./types";

interface SupplierRowProps {
  supplier: SupplierSearchResult;
  itemName: string;
  onAddToDraft: (supplier: SupplierSearchResult) => void;
  isInDraft: boolean;
}

export function SupplierRow({ supplier, itemName, onAddToDraft, isInDraft }: SupplierRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Supplier / Toko */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-blue-700">{supplier.name}</p>
        </div>
      </td>

      {/* Harga Satuan */}
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-900">
          Rp {supplier.price.toLocaleString("id-ID")}
          <span className="text-gray-500 font-normal ml-1">/ {supplier.unit}</span>
        </p>
      </td>

      {/* Ketersediaan Stok */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-500">-</p>
      </td>

      {/* Metode Pengiriman */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-500">-</p>
      </td>

      {/* Aksi */}
      <td className="px-4 py-4">
        <button
          onClick={() => onAddToDraft(supplier)}
          disabled={isInDraft}
          className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
            isInDraft
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
          }`}
        >
          {isInDraft ? "Dipilih" : "+ Pilih"}
        </button>
      </td>
    </tr>
  );
}
