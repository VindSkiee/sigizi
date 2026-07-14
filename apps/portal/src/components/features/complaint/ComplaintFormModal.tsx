"use client";

import { useState, useRef } from "react";
import { X, Flag, Camera, Trash2, Loader2, AlertCircle } from "lucide-react";
import { submitComplaint } from "@/lib/api";

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  reportKey: string;
  batchNumber: string;
}

export function ComplaintFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  reportKey,
  batchNumber,
}: ComplaintFormModalProps) {
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<string | null>(null);
  const [evidenceName, setEvidenceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG/PNG).");
      return;
    }

    setError("");
    setEvidenceName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setEvidence(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEvidence = () => {
    setEvidence(null);
    setEvidenceName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Deskripsi masalah wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await submitComplaint({
        reportKey,
        description: description.trim(),
        evidence: evidence || undefined,
      });

      if (!response.success) {
        throw new Error("Gagal mengirim laporan");
      }

      onSubmitSuccess();
      setDescription("");
      setEvidence(null);
      setEvidenceName("");
    } catch (err: any) {
      setError(err.message || "Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription("");
      setEvidence(null);
      setEvidenceName("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Laporkan Masalah
              </h2>
              <p className="text-xs text-gray-500">Batch {batchNumber}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi Masalah <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="Jelaskan masalah yang Anda temui (contoh: nasi berbau basi, lauk tidak segar, dll)"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bukti Foto <span className="text-gray-400 font-normal">(opsional)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {evidence ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {evidenceName}
                  </p>
                  <p className="text-xs text-green-600">Siap dikirim</p>
                </div>
                <button
                  onClick={handleRemoveEvidence}
                  disabled={isSubmitting}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Klik untuk upload foto
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG/PNG, maksimal 5MB
                </p>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Flag className="w-4 h-4" />
                Kirim Laporan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
