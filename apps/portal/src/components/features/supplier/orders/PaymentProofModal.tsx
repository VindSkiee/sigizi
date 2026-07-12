import { OrderViewModel } from "./types";
import { X, FileText, Download, Eye } from "lucide-react";

interface PaymentProofModalProps {
  order: OrderViewModel;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function generateOrderNumber(id: string): string {
  const num = id.slice(-3).replace(/\D/g, "0").padStart(3, "0");
  return `ORD-${num}`;
}

export function PaymentProofModal({ order, onClose }: PaymentProofModalProps) {
  const orderNumber = generateOrderNumber(order.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Bukti Pembayaran</h3>
            <p className="text-sm text-gray-500">{orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Summary */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Pembayaran</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(order.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  LUNAS
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof Image Placeholder */}
          <div className="bg-gray-100 rounded-xl p-8 w-full flex items-center justify-center min-h-[320px] border-2 border-dashed border-gray-300 relative group cursor-pointer hover:bg-gray-200 transition-colors">
            <div className="text-center text-gray-400 group-hover:text-gray-500 transition-colors">
              <FileText size={48} className="mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">bukti_pembayaran_{orderNumber}.jpg</p>
              <p className="text-xs text-gray-400 mt-1">Klik untuk melihat penuh</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 justify-end">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Eye size={16} />
              Lihat Penuh
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Download size={16} />
              Unduh Gambar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
