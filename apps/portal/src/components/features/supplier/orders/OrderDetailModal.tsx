import { OrderViewModel } from "./types";
import { StatusBadge } from "./StatusBadge";
import { X, MapPin, Calendar } from "lucide-react";
import { haversineDistance } from "@/lib/geo";

interface OrderDetailModalProps {
  order: OrderViewModel;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getDistanceKm(order: OrderViewModel): number | null {
  if (
    order.supplierLat == null ||
    order.supplierLng == null ||
    order.sppgLat == null ||
    order.sppgLng == null
  )
    return null;
  return haversineDistance(
    order.supplierLat,
    order.supplierLng,
    order.sppgLat,
    order.sppgLng,
  );
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const distance = getDistanceKm(order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Detail Pesanan
            </h3>
            <StatusBadge status={order.status} size="md" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pemesan</p>
              <p className="font-medium text-gray-800">{order.sppgName}</p>
              <p className="text-sm text-gray-600 mt-1">{order.sppgAddress}</p>
              {distance != null && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} />
                  {distance.toFixed(1)} km dari lokasi Anda
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal Pesan</p>
              <p className="font-medium text-gray-800">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-3 font-medium">
              Daftar Barang
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.name}: {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} ×{" "}
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(order.total)}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">Status Pesanan</p>
            <div className="flex items-center gap-2">
              {order.status === "PENDING" && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <p className="text-sm text-gray-700">
                    Menunggu konfirmasi dari Anda
                  </p>
                </>
              )}
              {order.status === "CONFIRMED" && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-sm text-gray-700">
                    Pesanan dikonfirmasi. Siap untuk dikirim.
                  </p>
                </>
              )}
              {order.status === "DELIVERED" && (
                <>
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <p className="text-sm text-gray-700">
                    Barang sudah dikirim ke SPPG.
                  </p>
                </>
              )}
              {order.status === "COMPLETED" && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-sm text-gray-700">
                    Pesanan selesai. Pembayaran telah diterima.
                  </p>
                </>
              )}
              {order.status === "CANCELLED" && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <p className="text-sm text-gray-700">Pesanan dibatalkan.</p>
                </>
              )}
            </div>
            {order.status === "CANCELLED" && order.cancelledReason && (
              <p className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2">
                Alasan: {order.cancelledReason}
              </p>
            )}
          </div>
        </div>

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
