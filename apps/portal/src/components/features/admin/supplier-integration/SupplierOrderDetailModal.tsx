"use client";

import { SupplierOrder, ORDER_STATUS_CONFIG } from "./types";

interface SupplierOrderDetailModalProps {
  order: SupplierOrder | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function SupplierOrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: SupplierOrderDetailModalProps) {
  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Detail Pesanan
            </h2>
            <p className="text-sm text-gray-500">
              #PO-{order.id.slice(-4).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-sm text-gray-500">
              Dibuat: {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Supplier Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Informasi Supplier
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nama</p>
                <p className="font-medium">{order.supplier?.name || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">NIB</p>
                <p className="font-medium">{order.supplier?.nib || "-"}</p>
              </div>
            </div>
            {order.mou && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mitra Resmi - {order.mou.mouNumber}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Detail Barang
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Harga Satuan
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.unit} × Rp{" "}
                          {item.unitPrice.toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-700">
                        Rp {item.unitPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-blue-50 rounded-lg p-4 min-w-[250px]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pesanan</span>
                <span className="text-lg font-bold text-blue-700">
                  Rp {order.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Catatan
              </h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          {statusConfig.nextAction && order.status !== "PENDING" && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, statusConfig.nextStatus!);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {statusConfig.nextAction}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
