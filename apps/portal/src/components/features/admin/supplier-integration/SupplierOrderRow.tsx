"use client";

import { Check } from "lucide-react";
import { SupplierOrder, ORDER_STATUS_CONFIG, getDisplayStatus } from "./types";
import { formatCurrency } from "@/lib/utils";

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
  const displayStatus = getDisplayStatus(order.status, order.paidAt);
  const statusConfig = ORDER_STATUS_CONFIG[displayStatus] || {
    label: order.status || "Unknown",
    color: "bg-gray-100 text-gray-800",
  };

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
      {/* 1. Tanggal Pesanan */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(order.createdAt)}
          </p>
          <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
        </div>
      </td>

      {/* 2. Supplier */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {order.supplier?.name || "Unknown Supplier"}
          </p>
        </div>
      </td>

      {/* 3. Detail Barang */}
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

      {/* 4. Jumlah Item */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {order.items?.length || 0} item
        </span>
      </td>

      {/* 5. Status */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </td>

      {/* 6. Total */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-900 text-right">
          {formatCurrency(order.total)}
        </p>
      </td>

      {/* 7. Aksi */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onViewDetail(order)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Detail
          </button>

          {statusConfig?.nextAction && (
              <button
                onClick={() =>
                  onUpdateStatus(order.id, statusConfig.nextStatus!)
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
              >
                {statusConfig.nextStatus !== "PAY" && (
                  <Check className="w-4 h-4" />
                )}
                {statusConfig.nextAction}
              </button>
            )}

          {statusConfig?.cancelAction && (
              <button
                onClick={() =>
                  onUpdateStatus(order.id, statusConfig.cancelStatus!)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
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
                {statusConfig.cancelAction}
              </button>
            )}
        </div>
      </td>
    </tr>
  );
}
