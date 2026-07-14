"use client";

import { useState, useEffect, useRef } from "react";
import { X, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

interface ComplaintPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  correctPin: string;
}

export function ComplaintPinModal({
  isOpen,
  onClose,
  onVerified,
  correctPin,
}: ComplaintPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showValue, setShowValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      setShowValue(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleVerify = () => {
    const normalizedPin = pin.trim().toUpperCase();
    const normalizedCorrect = correctPin.trim().toUpperCase();
    if (normalizedPin.length !== 8) {
      setError("Kode laporan harus 8 karakter.");
      return;
    }
    if (normalizedPin === normalizedCorrect) {
      onVerified();
    } else {
      setError("Kode laporan salah. Silakan coba lagi.");
      setPin("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Verifikasi Laporan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Masukkan Kode Laporan
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Masukkan 8 kode huruf/angka yang tertera pada batch makanan.
            </p>
            <div className="relative">
              <input
                ref={inputRef}
                type={showValue ? "text" : "password"}
                inputMode="text"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                  setPin(val);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Contoh: A7X9K2M4"
                className="w-full px-4 py-3 pr-12 text-center text-2xl tracking-[0.3em] font-mono uppercase border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showValue ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleVerify}
            disabled={pin.length !== 8}
            className="px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
