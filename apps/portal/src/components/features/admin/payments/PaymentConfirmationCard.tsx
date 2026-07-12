"use client";

import { useState } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Invoice } from "./types";

interface PaymentConfirmationCardProps {
  invoice: Invoice;
  onSubmit: (file: File, notes: string) => void;
}

export function PaymentConfirmationCard({
  invoice,
  onSubmit,
}: PaymentConfirmationCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleOpenConfirmPopup = () => {
    if (!selectedFile) return;
    setShowConfirmPopup(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSubmit(selectedFile!, notes);
    setIsSubmitting(false);
    setShowConfirmPopup(false);
    setSelectedFile(null);
    setNotes("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">
              Konfirmasi Pembayaran
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col space-y-3 overflow-auto">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-600 uppercase tracking-wide">
                  Total Pembayaran
                </p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-600">Invoice</p>
                <p className="text-xs font-semibold text-blue-800">
                  {invoice.invoiceNumber}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Bukti Pembayaran <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors h-[calc(100%-28px)] flex items-center justify-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus File
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Klik atau seret file
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG, PDF (Maks. 5MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleOpenConfirmPopup}
              disabled={!selectedFile}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                selectedFile
                  ? "bg-blue-700 text-white hover:bg-blue-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Kirim Konfirmasi Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Popup Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Konfirmasi Pembayaran
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pastikan data sudah benar
                  </p>
                </div>
              </div>
            </div>

            {/* Popup Content */}
            <div className="p-5 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Supplier</span>
                  <span className="font-medium text-gray-900">
                    {invoice.supplierName}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    Total
                  </span>
                  <span className="text-base font-bold text-blue-700">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700 truncate">
                    {selectedFile.name}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Dengan mengirim konfirmasi ini, Anda menyatakan bahwa pembayaran
                sudah dilakukan sesuai jumlah tagihan.
              </p>
            </div>

            {/* Popup Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConfirmPopup(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  "Ya, Kirim"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
