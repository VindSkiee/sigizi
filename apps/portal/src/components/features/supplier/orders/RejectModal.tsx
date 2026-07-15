import { useState } from "react";
import { X, XCircle } from "lucide-react";

interface RejectModalProps {
  orderNumber: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const QUICK_REASONS = [
  "Stok tidak tersedia",
  "Harga tidak sesuai",
  "Jarak terlalu jauh",
  "Kapasitas produksi terbatas",
];

export function RejectModal({
  orderNumber,
  onConfirm,
  onClose,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  function handleSubmit() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Tolak Pesanan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Berikan alasan penolakan untuk pesanan ini:
          </p>

          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((qr) => (
              <button
                key={qr}
                onClick={() => setReason(qr)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  reason === qr
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {qr}
              </button>
            ))}
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tulis alasan penolakan..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tolak Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
