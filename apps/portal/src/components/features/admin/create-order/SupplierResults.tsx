"use client";

import { SupplierSearchResult } from "./types";
import { SupplierRow } from "./SupplierRow";

interface SupplierResultsProps {
  suppliers: SupplierSearchResult[];
  itemName: string;
  draftSupplierIds: string[];
  onAddToDraft: (supplier: SupplierSearchResult) => void;
}

export function SupplierResults({
  suppliers,
  itemName,
  draftSupplierIds,
  onAddToDraft,
}: SupplierResultsProps) {
  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm text-gray-500">Tidak ada supplier yang menyediakan item ini</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 mb-4">
        Menampilkan supplier yang menyediakan: <span className="font-semibold text-gray-900">{itemName}</span>
      </p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Supplier / Toko
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Harga Satuan
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ketersediaan Stok
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Metode Pengiriman
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <SupplierRow
                key={supplier.id}
                supplier={supplier}
                itemName={itemName}
                onAddToDraft={onAddToDraft}
                isInDraft={draftSupplierIds.includes(supplier.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
