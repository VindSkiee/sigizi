"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/api";
import { clearDraft } from "@/lib/draft";
import { DraftItem } from "@/components/features/admin/create-order/types";
import { formatCurrency } from "@/lib/utils";

interface DraftOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DraftItem[];
  onUpdateQuantity: (draftId: string, qty: number) => void;
  onRemove: (draftId: string) => void;
}

export function DraftOrderModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}: DraftOrderModalProps) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleSubmit = async () => {
    if (!token || !user || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const groupedBySupplier = items.reduce<Record<string, DraftItem[]>>(
        (acc, item) => {
          if (!acc[item.supplierId]) acc[item.supplierId] = [];
          acc[item.supplierId].push(item);
          return acc;
        },
        {}
      );

      for (const [, supplierItems] of Object.entries(groupedBySupplier)) {
        await createOrder(
          token,
          {
            supplierId: supplierItems[0].supplierId,
            items: supplierItems.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          user.sppgId || "",
          user.id
        );
      }

      clearDraft();
      onClose();
      router.push("/admin/suppliers");
    } catch {
      alert("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-50 border-b border-primary-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Daftar Pesanan Anda (Draft)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-gray-500 text-sm">Belum ada item dalam draft</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-5">Barang & Supplier Terpilih</div>
                <div className="col-span-3">Harga Satuan</div>
                <div className="col-span-2">Jumlah (QTY)</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>

              {/* Table Rows */}
              {items.map((item) => (
                <div
                  key={item.draftId}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center"
                >
                  {/* Item + Supplier */}
                  <div className="col-span-5">
                    <p className="text-sm font-semibold text-gray-900">{item.itemName}</p>
                    <p className="text-xs text-gray-500">{item.supplierName}</p>
                  </div>

                  {/* Harga */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-700">
                      {formatCurrency(item.unitPrice)} / {item.unit}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(item.draftId, Math.max(1, Number(e.target.value)))
                      }
                      className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Aksi */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => onRemove(item.draftId)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Proses Pesanan (PO)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
