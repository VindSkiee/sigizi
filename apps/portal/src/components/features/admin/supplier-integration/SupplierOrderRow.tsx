"use client";

import { SupplierOrder, ORDER_STATUS_CONFIG } from "./types";

interface SupplierOrderRowProps {
  order: SupplierOrder;
  onViewDetail: (order: SupplierOrder) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function SupplierOrderRow({
  order,
  onViewDetail,
  onUpdateStatus,
}: SupplierOrderRowProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayItems = order.items?.slice(0, 2) || [];
  const extraCount = (order.items?.length || 0) - 2;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* ID Pesanan */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            #PO-{order.id.slice(-4).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
          </p>
        </div>
      </td>

      {/* Supplier */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {order.supplier?.name || "Unknown Supplier"}
          </p>
          {order.mou && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-0.5">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Mitra Resmi (MoU)
            </span>
          )}
        </div>
      </td>

      {/* Detail Barang */}
      <td className="px-4 py-4">
        <div className="text-sm text-gray-700">
          {displayItems.map((item, idx) => (
            <p key={item.id}>
              {item.name || "Item"} ({item.quantity} {item.unit || ""})
              {idx < displayItems.length - 1 && ","}
            </p>
          ))}
          {extraCount > 0 && (
            <button
              onClick={() => onViewDetail(order)}
              className="text-xs text-blue-600 hover:underline mt-0.5"
            >
              +{extraCount} item lainnya
            </button>
          )}
          {order.items && order.items.length <= 2 && (
            <button
              onClick={() => onViewDetail(order)}
              className="text-xs text-blue-600 hover:underline mt-0.5 block"
            >
              Lihat Detail
            </button>
          )}
        </div>
      </td>

      {/* Estimasi Tiba */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm text-gray-700">
            {order.estimatedArrival
              ? new Date(order.estimatedArrival).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }) + ", " + new Date(order.estimatedArrival).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </td>

      {/* Aksi */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onViewDetail(order)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Detail
          </button>
          {statusConfig.nextAction && order.status !== "PENDING" && (
            <button
              onClick={() =>
                onUpdateStatus(order.id, statusConfig.nextStatus!)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {statusConfig.nextAction}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
