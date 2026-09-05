"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/api";
import { clearDraft } from "@/lib/draft";
import { DraftItem } from "@/components/features/admin/create-order/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Calendar, Package, StickyNote, Trash2 } from "lucide-react";
import type { MarketLocationParams } from "@/lib/api";

interface DraftOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DraftItem[];
  marketFilter?: MarketLocationParams | null;
  onUpdateQuantity: (draftId: string, qty: number) => void;
  onRemove: (draftId: string) => void;
  onOrderSuccess: () => void;
}

export function DraftOrderModal({
  isOpen,
  onClose,
  items,
  marketFilter,
  onUpdateQuantity,
  onRemove,
  onOrderSuccess,
}: DraftOrderModalProps) {
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceJustification, setPriceJustification] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [warningInfo, setWarningInfo] = useState<{
    supplierName: string;
    items: Array<{
      itemId: string;
      itemName: string;
      unitPrice: number;
      status: string;
      reason: string;
      recommendation: string;
      marketMedianSnapshot: number;
    }>;
  } | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  // supplierId yang sudah berhasil diproses (cegah order duplikat saat retry)
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      processedRef.current.clear();
      setWarningInfo(null);
      setStockError(null);
      setPriceJustification("");
      setExpectedDeliveryDate("");
      setNotes("");
    }
  }, [isOpen]);

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const hasStockIssue = items.some(
    (item) => item.stock != null && item.quantity > item.stock,
  );

  const handleSubmit = async (justification?: string) => {
    if (!token || !user || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const groupedBySupplier = items.reduce<Record<string, DraftItem[]>>(
        (acc, item) => {
          if (!acc[item.supplierId]) acc[item.supplierId] = [];
          acc[item.supplierId].push(item);
          return acc;
        },
        {},
      );

      for (const [supplierId, supplierItems] of Object.entries(
        groupedBySupplier,
      )) {
        // Lewati supplier yang sudah berhasil diproses (cegah order duplikat saat retry)
        if (processedRef.current.has(supplierId)) continue;

        const body: {
          supplierId: string;
          items: { itemId: string; quantity: number }[];
          priceJustification?: string;
          marketFilter?: MarketLocationParams;
          expectedDeliveryDate?: string;
          notes?: string;
        } = {
          supplierId: supplierItems[0].supplierId,
          items: supplierItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        };
        if (justification) body.priceJustification = justification;
        if (expectedDeliveryDate.trim()) body.expectedDeliveryDate = expectedDeliveryDate;
        if (notes.trim()) body.notes = notes.trim();
        // Sertakan scope pasar yg dilihat admin agar validasi harga konsisten
        // dgn persentase yg ditampilkan di MarketCard
        if (marketFilter) body.marketFilter = marketFilter;

        try {
          await createOrder(token, body, user.sppgId || "", user.id);
          processedRef.current.add(supplierId);
        } catch (err: any) {
          const msg = err?.message || err?.error?.message || "";
          const isJustificationError =
            err?.code === "BAD_REQUEST" && /priceJustification/i.test(msg);
          if (isJustificationError) {
            setWarningInfo({
              supplierName: supplierItems[0].supplierName,
              items: err?.details || [],
            });
            setIsSubmitting(false);
            return; // pause, tunggu user isi justifikasi lalu retry
          }
          throw err; // error lain (mis. status INVALID) -> lempar ke outer catch
        }
      }

      clearDraft();
      processedRef.current.clear();
      onClose();
      onOrderSuccess();
    } catch (err: any) {
      const message =
        err?.message || err?.error?.message || "Gagal membuat pesanan. Silakan coba lagi.";
      const isStockError = /stok|stock|melebihi/i.test(message);
      if (isStockError) {
        setStockError(message);
      } else {
        const detailNames = Array.isArray(err?.details)
          ? err.details.map((d: any) => d?.itemName).filter(Boolean).join(", ")
          : "";
        alert(detailNames ? `${message}\n\nItem: ${detailNames}` : message);
      }
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-primary-50 border-b border-primary-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">
              Daftar Pesanan Anda (Draft)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <p className="text-gray-500 text-sm">
                Belum ada item dalam draft
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-4">Barang & Supplier</div>
                <div className="col-span-2">Harga Satuan</div>
                <div className="col-span-3">Jumlah (QTY)</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>

              {/* Table Rows */}
              {items.map((item) => {
                const minQty = item.minOrderQty ?? 1;
                const step = item.orderStep ?? 1;
                const rowTotal = item.unitPrice * item.quantity;

                return (
                  <div
                    key={item.draftId}
                    className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-gray-100 items-center"
                  >
                    {/* Item + Supplier */}
                    <div className="col-span-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.itemName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.supplierName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.minOrderQty != null && item.minOrderQty > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Package className="w-3 h-3" />
                            Min: {minQty} {item.unit}
                          </span>
                        )}
                        {item.stock != null && (
                          <span className={`inline-flex items-center gap-1 text-xs ${item.stock <= 0 ? 'text-red-500' : item.stock < 10 ? 'text-amber-500' : 'text-gray-400'}`}>
                            Stok: {item.stock} {item.unit}
                          </span>
                        )}
                      </div>
                      {item.stock != null && item.quantity > item.stock && (
                        <p className="text-xs text-red-500 mt-1">
                          Melebihi stok tersedia
                        </p>
                      )}
                    </div>

                    {/* Harga */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="text-xs text-gray-400">/ {item.unit}</p>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={minQty}
                          max={item.stock}
                          step={step}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Math.max(
                              minQty,
                              Number(e.target.value),
                            );
                            onUpdateQuantity(item.draftId, val);
                          }}
                          className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="text-xs text-gray-500">
                          {item.unit}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Kelipatan pesanan: {step} {item.unit}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(rowTotal)}
                      </p>
                    </div>

                    {/* Aksi */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => onRemove(item.draftId)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            {/* Panel Error Stock */}
            {stockError && (
              <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Gagal membuat pesanan
                    </p>
                    <p className="text-xs text-red-700 mt-1">{stockError}</p>
                    <button
                      onClick={() => setStockError(null)}
                      className="text-xs text-red-600 underline mt-2 hover:text-red-800"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Peringatan Stok */}
            {hasStockIssue && !stockError && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Stok tidak mencukupi
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Beberapa item memiliki jumlah pesanan melebihi stok yang tersedia.
                      Silakan kurangi jumlah atau hapus item.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Peringatan Harga WARNING */}
            {warningInfo && (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Perhatian: Beberapa item memiliki harga di atas normal
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Supplier: {warningInfo.supplierName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {warningInfo.items.map((w) => (
                    <div
                      key={w.itemId}
                      className="rounded-lg bg-white border border-amber-200 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {w.itemName}
                        </p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {w.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
                        <span>
                          Harga diajukan:{" "}
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(w.unitPrice)}
                          </span>
                        </span>
                        {w.marketMedianSnapshot ? (
                          <span>
                            Median pasar:{" "}
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(w.marketMedianSnapshot)}
                            </span>
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-600">{w.reason}</p>
                      {w.recommendation && (
                        <p className="text-xs text-amber-700 mt-1">
                          Rekomendasi: {w.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <label className="block text-xs font-semibold text-amber-800 mb-1">
                  Alasan Justifikasi Pembelian{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={priceJustification}
                  onChange={(e) => setPriceJustification(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Stok lokal langka, supplier terdekat hanya ini yang tersedia"
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                />
                <p className="text-xs text-amber-700 mt-1">
                  Alasan ini akan dicatat sebagai justifikasi pembelian pada tiap item.
                </p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(total)}
              </p>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Tanggal Pengiriman yang Diharapkan
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1">
                  <StickyNote className="w-3.5 h-3.5" />
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Contoh: Mohon kirim sebelum jam 10 pagi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
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
                onClick={() =>
                  warningInfo
                    ? handleSubmit(priceJustification)
                    : handleSubmit()
                }
                disabled={
                  isSubmitting ||
                  hasStockIssue ||
                  (warningInfo ? priceJustification.trim() === "" : false)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Memproses...
                  </>
                ) : warningInfo ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Lanjutkan dengan Justifikasi
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
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
