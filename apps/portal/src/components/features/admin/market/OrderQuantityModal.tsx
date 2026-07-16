"use client";

import { useState, useEffect, useCallback } from "react";
import { MarketSupplierItem } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Info, Minus, Plus } from "lucide-react";

interface OrderQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketSupplierItem | null;
  onConfirm: (quantity: number) => void;
}

export function OrderQuantityModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: OrderQuantityModalProps) {
  const minQty = item?.minOrderQty ?? 1;
  const step = item?.orderStep ?? 1;

  const [quantity, setQuantity] = useState(minQty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setQuantity(minQty);
      setError("");
    }
  }, [item, minQty]);

  const roundToStep = useCallback(
    (value: number) => {
      if (step <= 0) return value;
      const steps = Math.round(value / step);
      return Math.round(steps * step * 100) / 100;
    },
    [step],
  );

  const validateQuantity = useCallback(
    (value: number): boolean => {
      if (value < minQty) {
        setError(`Minimum pemesanan adalah ${minQty} ${item?.unit ?? ""}`);
        return false;
      }
      if (step > 0) {
        const remainder = Math.round(((value - minQty) % step) * 100) / 100;
        if (remainder !== 0) {
          setError(
            `Jumlah harus kelipatan ${step} ${item?.unit ?? ""} (mulai dari ${minQty})`,
          );
          return false;
        }
      }
      setError("");
      return true;
    },
    [minQty, step, item?.unit],
  );

  const handleDecrease = () => {
    const newQty = roundToStep(Math.max(minQty, quantity - step));
    setQuantity(newQty);
    validateQuantity(newQty);
  };

  const handleIncrease = () => {
    const newQty = roundToStep(quantity + step);
    setQuantity(newQty);
    validateQuantity(newQty);
  };

  const handleInputChange = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setQuantity(minQty);
      setError("");
      return;
    }
    setQuantity(num);
    validateQuantity(num);
  };

  const handleConfirm = () => {
    if (validateQuantity(quantity)) {
      onConfirm(quantity);
    }
  };

  if (!isOpen || !item) return null;

  const total = item.price * quantity;

  const examples = (() => {
    const vals: number[] = [];
    let current = minQty;
    for (let i = 0; i < 5; i++) {
      vals.push(current);
      current = roundToStep(current + step);
    }
    return vals;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
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
            <h2 className="text-lg font-bold text-gray-900">Pesan Bahan</h2>
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
        <div className="px-6 py-5">
          {/* Item Info */}
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">
              {item.itemName}
            </h3>
            <p className="text-sm text-gray-500">{item.supplierName}</p>
            <p className="text-lg font-bold text-primary-600 mt-1">
              {formatCurrency(item.price)}{" "}
              <span className="text-sm font-normal text-gray-500">
                / {item.unit}
              </span>
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <span className="font-semibold">Min. beli:</span> {minQty}{" "}
                  {item.unit}
                </p>
                {step > 0 && step !== 1 && (
                  <p>
                    <span className="font-semibold">Kelipatan pesan:</span> {step}{" "}
                    {item.unit}
                  </p>
                )}
                <p className="text-blue-600">
                  Contoh: {examples.join(", ")} {item.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah ({item.unit})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= minQty}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={minQty}
                step={step > 0 ? step : undefined}
                value={quantity}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1 w-24 border border-gray-300 rounded-lg px-4 py-2.5 text-center text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleIncrease}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Total Harga
            </span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!!error}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Tambah ke Draft
          </button>
        </div>
      </div>
    </div>
  );
}
