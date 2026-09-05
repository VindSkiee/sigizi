"use client";

import { X, ShieldCheck, Check, Info } from "lucide-react";
import { SupplierOrder, ORDER_STATUS_CONFIG, getDisplayStatus } from "./types";

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

  const displayStatus = getDisplayStatus(order.status, order.paidAt);
  const statusConfig = ORDER_STATUS_CONFIG[displayStatus];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Subtle Backdrop with slight blur */}
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-start justify-between px-8 pt-4 pb-3 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Order #PO-{order.id.slice(-4).toUpperCase()}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Diterbitkan pada {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto px-8 py-8 space-y-10">
          {/* Supplier Info (Clean layout, no gray box) */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Informasi Supplier
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {order.supplier?.name || "Unknown Supplier"}
                </p>
                {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && order.mou && (
                  <p className="flex items-center gap-1.5 text-sm text-green-600 mt-1">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                    <span className="font-medium">Mitra Resmi</span>
                    <span className="text-green-600/50 mx-1">•</span>
                    <span>{order.mou.mouNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Detail Barang
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left font-medium text-gray-500">
                      Item
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 w-24">
                      Qty
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 w-36">
                      Harga Satuan
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-900 w-40">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {(item as any).commodityName && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                              {(item as any).commodityName}
                            </span>
                            {(item as any).categoryName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                {(item as any).categoryName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right text-gray-600 tabular-nums">
                        {item.quantity}{" "}
                        <span className="text-gray-400 text-xs ml-0.5">
                          {item.unit}
                        </span>
                      </td>
                      <td className="py-4 text-right text-gray-600 tabular-nums">
                        Rp {item.unitPrice.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900 tabular-nums">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Elegant Total Section */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between w-full sm:w-72">
                <span className="text-sm text-gray-500">Total Keseluruhan</span>
                <span className="text-2xl font-semibold text-gray-900 tracking-tight tabular-nums">
                  Rp {order.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </section>

          {/* Notes (Minimalist Quote Style instead of Yellow Box) */}
          {order.notes && (
            <section className="bg-white">
              <div className="pl-4 border-l-2 border-gray-200 py-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Catatan Pesanan
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {order.notes}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-100"
          >
            Tutup
          </button>

          {statusConfig.cancelAction && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, statusConfig.cancelStatus!);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all focus:outline-none focus:ring-4 focus:ring-red-20"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              {statusConfig.cancelAction}
            </button>
          )}

          {statusConfig.nextAction && (
            <button
              onClick={() => {
                onUpdateStatus(order.id, statusConfig.nextStatus!);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
            >
              {statusConfig.nextStatus !== "PAY" && (
                <Check className="w-4 h-4" />
              )}
              {statusConfig.nextAction}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
