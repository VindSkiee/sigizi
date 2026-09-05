"use client";

import { X, Package, Store, Clock, CreditCard, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import {
  getStatusLabel,
  getStatusColor,
  type TransactionDetail,
  type StatusHistoryEntry,
} from "./types";

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_ICONS: Record<string, string> = {
  PENDING: "bg-yellow-400",
  CONFIRMED: "bg-blue-400",
  DELIVERED: "bg-purple-400",
  COMPLETED: "bg-green-400",
  CANCELLED: "bg-red-400",
};

function StatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  return (
    <div className="space-y-0">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1;
        const dotColor = STATUS_ICONS[entry.toStatus] ?? "bg-gray-400";
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full mt-1 ${dotColor} ring-2 ring-white`}
              />
              {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
            </div>
            <div className={`pb-4 ${isLast ? "" : ""}`}>
              <p className="text-sm font-medium text-gray-900">
                {getStatusLabel(entry.toStatus as any)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDateTime(entry.createdAt)}
              </p>
              {entry.notes && (
                <p className="text-xs text-gray-500 mt-0.5 italic">
                  &ldquo;{entry.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Detail Transaksi
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDateTime(transaction.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}
            >
              {getStatusLabel(transaction.status)}
            </span>
            {transaction.paidAt && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                Dibayar {formatDateTime(transaction.paidAt)}
              </span>
            )}
          </div>

          {/* Info Pesanan */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              Info Pesanan
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(transaction.total)}
                </span>
              </div>
              {transaction.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Catatan</span>
                  <span className="text-gray-700">{transaction.notes}</span>
                </div>
              )}
              {transaction.expectedDeliveryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimasi Pengiriman</span>
                  <span className="text-gray-700">
                    {formatDate(transaction.expectedDeliveryDate)}
                  </span>
                </div>
              )}
              {transaction.actualDeliveryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pengiriman Aktual</span>
                  <span className="text-gray-700">
                    {formatDate(transaction.actualDeliveryDate)}
                  </span>
                </div>
              )}
              {transaction.cancelledReason && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Alasan Pembatalan</span>
                  <span className="text-red-600">
                    {transaction.cancelledReason}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Pihak Lawan */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-400" />
              Mitra
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                {transaction.supplier.name}
              </p>
              {transaction.supplier.phone && (
                <p className="text-sm text-gray-600 mt-1">
                  {transaction.supplier.phone}
                </p>
              )}
              {transaction.supplier.address && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {transaction.supplier.address}
                </p>
              )}
            </div>
          </section>

          {/* Item Pesanan */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              Item Pesanan
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                      Harga
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaction.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-900">
                          {item.item.name}
                        </div>
                        {item.item.commodityName && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                              {item.item.commodityName}
                            </span>
                            {item.item.categoryName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                {item.item.categoryName}
                              </span>
                            )}
                          </div>
                        )}
                        {item.isWarningBypass && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-amber-600">
                              Harga diluar batas wajar
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {item.quantity} {item.item.unit}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Status Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Status Timeline
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <StatusTimeline history={transaction.statusHistory} />
            </div>
          </section>

          {/* Info Pembayaran */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              Info Pembayaran
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status Pembayaran</span>
                <span
                  className={`font-medium ${
                    transaction.paidAt ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {transaction.paidAt
                    ? `Dibayar ${formatDateTime(transaction.paidAt)}`
                    : "Belum Dibayar"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
