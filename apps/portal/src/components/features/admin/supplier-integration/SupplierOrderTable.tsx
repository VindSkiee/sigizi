"use client";

import { SupplierOrder } from "./types";
import { SupplierOrderRow } from "./SupplierOrderRow";

interface SupplierOrderTableProps {
  orders: SupplierOrder[];
  onViewDetail: (order: SupplierOrder) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function SupplierOrderTable({
  orders,
  onViewDetail,
  onUpdateStatus,
}: SupplierOrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-sm">Tidak ada pesanan ditemukan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tanggal Pesanan
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Supplier
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Detail Barang
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Jumlah Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <SupplierOrderRow
              key={order.id}
              order={order}
              onViewDetail={onViewDetail}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
