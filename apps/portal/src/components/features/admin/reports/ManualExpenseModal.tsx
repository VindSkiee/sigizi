"use client";

import { useState } from "react";
import { OPEX_CATEGORIES } from "./types";

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    category: string;
    amount: number;
    expenseDate: string;
    description: string;
    evidenceUrl?: string;
  }) => Promise<void>;
}

export function ManualExpenseModal({
  isOpen,
  onClose,
  onSave,
}: ManualExpenseModalProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<string>(OPEX_CATEGORIES[0].value);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!description.trim() || !amount) return;

    setIsSaving(true);
    setError("");

    try {
      const categoryLabel =
        OPEX_CATEGORIES.find((c) => c.value === category)?.label || category;
      await onSave({
        category,
        amount: Number(amount),
        expenseDate: date,
        description: description.trim(),
      });
      setDescription("");
      setAmount("");
      setCategory(OPEX_CATEGORIES[0].value);
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pengeluaran");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Input Pengeluaran Tambahan
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Catat pengeluaran operasional (bensin, transportasi, utilitas, dll)
            yang tidak ter-cover di modul pesanan.
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tanggal Pengeluaran
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {OPEX_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Bensin pengantaran harian"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nominal (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!description.trim() || !amount || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
