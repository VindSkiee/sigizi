"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, getSupplierById, updateOrderStatus } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eye, X, ClipboardList, FileText, Download } from "lucide-react";
import "@aejkatappaja/phantom-ui";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  batchNumber?: string;
  sppgName: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  paymentProof?: string;
}

// Status mapping: Backend → UI
const statusConfig = {
  PENDING: {
    label: "BARU",
    variant: "info" as const,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  CONFIRMED: {
    label: "DIPROSES",
    variant: "warning" as const,
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  DELIVERED: {
    label: "SELESAI",
    variant: "success" as const,
    badgeClass: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "GAGAL",
    variant: "danger" as const,
    badgeClass: "bg-red-100 text-red-700",
  },
};

type FilterType = "all" | "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

const filterLabels: Record<FilterType, string> = {
  all: "Semua",
  PENDING: "Baru",
  CONFIRMED: "Diproses",
  DELIVERED: "Selesai",
  CANCELLED: "Batal",
};

// Fallback data dari seed database
const fallbackOrders: Order[] = [
  {
    id: "ORD-001",
    batchNumber: "BATCH-20260710-001",
    sppgName: "SPPG Purwakarta",
    items: [
      {
        id: "1",
        name: "Beras Premium",
        quantity: 20,
        unitPrice: 11500,
        subtotal: 230000,
      },
      {
        id: "2",
        name: "Ayam Potong",
        quantity: 5,
        unitPrice: 34000,
        subtotal: 170000,
      },
      {
        id: "3",
        name: "Sayur Bayam",
        quantity: 25,
        unitPrice: 7500,
        subtotal: 187500,
      },
    ],
    total: 615000,
    status: "PENDING",
    createdAt: "2026-07-10T08:00:00Z",
  },
];

export default function PesananPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) {
      setOrders(fallbackOrders);
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [token]);

  async function fetchOrders() {
    try {
      const response = await getOrders(token!);
      if (response.success) {
        const items = (response.data as any)?.items || [];
        if (items.length > 0) {
          // Map backend data to frontend format
          const mapped = items.map((o: any) => ({
            id: o.id?.slice(-7) || o.id,
            batchNumber: o.batchNumber,
            sppgName: o.sppg?.name || o.sppgName || "SPPG",
            items: (o.items || []).map((item: any) => ({
              id: item.id,
              name: item.item?.name || item.name || "Item",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
            total: o.total,
            status: o.status,
            createdAt: o.createdAt,
            paymentProof: o.paymentProof,
          }));
          setOrders(mapped);
        } else {
          setOrders(fallbackOrders);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(orderId: string) {
    try {
      // Backend uses real ID, find it
      const realOrder = orders.find((o) => o.id === orderId);
      await updateOrderStatus(token!, realOrder?.id || orderId, "CONFIRMED");
      fetchOrders();
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  }

  async function handleReject(orderId: string) {
    try {
      const realOrder = orders.find((o) => o.id === orderId);
      await updateOrderStatus(token!, realOrder?.id || orderId, "CANCELLED");
      fetchOrders();
    } catch (err) {
      console.error("Failed to reject order:", err);
    }
  }

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatItems = (items: OrderItem[]) => {
    return items
      .map(
        (item) => `${item.name} ${item.quantity}${item.unitPrice ? "kg" : ""}`,
      )
      .join(", ");
  };

  return (
    <phantom-ui loading={loading}>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Daftar Pesanan Masuk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau dan kelola permintaan logistik dari unit SPPG.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(Object.keys(filterLabels) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => (
              <div
                key={`${order.id}-${idx}`}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-800">
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[order.status].badgeClass}`}
                      >
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {order.sppgName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Item: {formatItems(order.items)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Dipesan: {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 md:items-end">
                    {order.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAccept(order.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                        >
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {(order.status === "CONFIRMED" ||
                      order.status === "CANCELLED") && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
                      >
                        Detail Pesanan
                      </button>
                    )}
                    {order.status === "DELIVERED" && (
                      <>
                        <button
                          onClick={() => setShowPaymentModal(order)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                        >
                          <FileText size={16} />
                          Lihat Bukti Pembayaran
                        </button>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
                        >
                          Detail Pesanan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Detail Pesanan */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detail Pesanan {selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[selectedOrder.status].badgeClass}`}
                  >
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SPPG</p>
                  <p className="font-medium">{selectedOrder.sppgName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Items</p>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-gray-50"
                    >
                      <span className="text-sm">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-sm font-medium">
                        Rp {item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    Rp {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bukti Pembayaran */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bukti Pembayaran
                </h3>
                <button
                  onClick={() => setShowPaymentModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="bg-gray-100 rounded-xl p-8 w-full flex items-center justify-center min-h-[320px] border-2 border-dashed border-gray-300 relative group cursor-pointer hover:bg-gray-200 transition-colors">
                  <div className="text-center text-gray-400 group-hover:text-gray-500 transition-colors">
                    <FileText size={48} className="mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">
                      {showPaymentModal.paymentProof || "bukti_pembayaran.jpg"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Klik untuk melihat penuh
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-6 w-full justify-end">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Eye size={16} /> Lihat Penuh
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Download size={16} /> Unduh Gambar
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(null)}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </phantom-ui>
  );
}
