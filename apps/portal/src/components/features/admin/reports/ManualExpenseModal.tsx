"use client";

import { useState } from "react";
import { ManualExpense, MANUAL_EXPENSE_KEY } from "./types";

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ManualExpense) => void;
}

export function ManualExpenseModal({ isOpen, onClose, onSave }: ManualExpenseModalProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
  };

  const handleSave = () => {
    if (!description.trim() || !amount) return;

    const newExpense: ManualExpense = {
      id: `manual-${Date.now()}`,
      date,
      description: description.trim(),
      amount: Number(amount),
      fileUrl: fileName || undefined,
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem(MANUAL_EXPENSE_KEY) || "[]");
    localStorage.setItem(MANUAL_EXPENSE_KEY, JSON.stringify([...existing, newExpense]));

    onSave(newExpense);
    setDescription("");
    setAmount("");
    setFileName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Input Pengeluaran Tambahan</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Gunakan form ini untuk mencatat pengeluaran dapur yang tidak ter-cover di modul
            Integrasi Supplier (contoh: Gas LPG, Transportasi, dsb) agar masuk ke dalam
            laporan akuntansi.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* Date */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Deskripsi Laporan / Item
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembelian Gas LPG 12kg..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Amount */}
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Upload Bukti / Nota (Opsional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!description.trim() || !amount}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
