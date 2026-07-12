"use client";

import { useState } from "react";
import { X, ClipboardList, FileText, Download, Eye } from "lucide-react";

// ============================================================================
// CATATAN ENDPOINT (untuk integrasi backend nanti)
// ============================================================================
// GET  /api/orders?supplierId={supplierId}  → List pesanan supplier
// GET  /api/orders/:id                      → Detail pesanan
// PUT  /api/orders/:id/status               → Update status (CONFIRMED/CANCELLED)
//
// Status flow: PENDING → CONFIRMED → DELIVERED → COMPLETED
// Supplier bisa: PENDING → CONFIRMED (konfirmasi) atau PENDING → CANCELLED (tolak)
// ============================================================================

// ============================================================================
// INTERFACES (sesuai struktur response backend)
// ============================================================================

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  item: {
    id: string;
    name: string;
    unit: string;
    basePrice: number;
  };
}

interface Order {
  id: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  total: number;
  notes?: string;
  sppgId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
  sppg: {
    id: string;
    name: string;
  };
  supplier: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

// Frontend-friendly format (setelah mapping)
interface OrderViewModel {
  id: string;
  sppgName: string;
  supplierName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }[];
  total: number;
  status: Order["status"];
  createdAt: string;
}

// ============================================================================
// MAPPING FUNCTION (backend → frontend)
// ============================================================================

function mapOrderFromBackend(raw: Order): OrderViewModel {
  return {
    id: raw.id,
    sppgName: raw.sppg?.name || "SPPG",
    supplierName: raw.supplier?.name || "Supplier",
    items: raw.items.map((i) => ({
      id: i.id,
      name: i.item?.name || "Item",
      quantity: i.quantity,
      unit: i.item?.unit || "",
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig = {
  PENDING: {
    label: "BARU",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  CONFIRMED: {
    label: "DIPROSES",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  DELIVERED: {
    label: "SELESAI",
    badgeClass: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "GAGAL",
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

// ============================================================================
// MOCK DATA (sesuai struktur response backend)
// Akan diganti dengan real API setelah backend team verifikasi endpoint
// ============================================================================

const MOCK_ORDERS_RAW: Order[] = [
  {
    id: "cm8k2n5p6q7r1s0t001",
    status: "PENDING",
    total: 1160000,
    notes: null,
    sppgId: "cm8k2n5p6q7r1s0t010",
    supplierId: "cm8k2n5p6q7r1s0t020",
    createdAt: "2026-05-22T08:00:00Z",
    updatedAt: "2026-05-22T08:00:00Z",
    sppg: { id: "cm8k2n5p6q7r1s0t010", name: "SPPG Bandung 01" },
    supplier: { id: "cm8k2n5p6q7r1s0t020", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "cm8k2n5p6q7r1s0t031",
        quantity: 50,
        unitPrice: 12000,
        subtotal: 600000,
        item: { id: "cm8k2n5p6q7r1s0t041", name: "Beras", unit: "kg", basePrice: 12000 },
      },
      {
        id: "cm8k2n5p6q7r1s0t032",
        quantity: 20,
        unitPrice: 28000,
        subtotal: 560000,
        item: { id: "cm8k2n5p6q7r1s0t042", name: "Telur", unit: "kg", basePrice: 28000 },
      },
    ],
  },
  {
    id: "cm8k2n5p6q7r1s0t002",
    status: "CONFIRMED",
    total: 2040000,
    notes: null,
    sppgId: "cm8k2n5p6q7r1s0t011",
    supplierId: "cm8k2n5p6q7r1s0t020",
    createdAt: "2026-05-21T09:30:00Z",
    updatedAt: "2026-05-21T10:00:00Z",
    sppg: { id: "cm8k2n5p6q7r1s0t011", name: "SPPG Cimahi Central" },
    supplier: { id: "cm8k2n5p6q7r1s0t020", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "cm8k2n5p6q7r1s0t033",
        quantity: 15,
        unitPrice: 120000,
        subtotal: 1800000,
        item: { id: "cm8k2n5p6q7r1s0t043", name: "Daging Sapi", unit: "kg", basePrice: 120000 },
      },
      {
        id: "cm8k2n5p6q7r1s0t034",
        quantity: 30,
        unitPrice: 8000,
        subtotal: 240000,
        item: { id: "cm8k2n5p6q7r1s0t044", name: "Wortel", unit: "kg", basePrice: 8000 },
      },
    ],
  },
  {
    id: "cm8k2n5p6q7r1s0t003",
    status: "CANCELLED",
    total: 2800000,
    notes: null,
    sppgId: "cm8k2n5p6q7r1s0t012",
    supplierId: "cm8k2n5p6q7r1s0t020",
    createdAt: "2026-05-18T14:00:00Z",
    updatedAt: "2026-05-18T15:00:00Z",
    sppg: { id: "cm8k2n5p6q7r1s0t012", name: "SPPG Padalarang" },
    supplier: { id: "cm8k2n5p6q7r1s0t020", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "cm8k2n5p6q7r1s0t035",
        quantity: 100,
        unitPrice: 28000,
        subtotal: 2800000,
        item: { id: "cm8k2n5p6q7r1s0t045", name: "Telur Ayam", unit: "kg", basePrice: 28000 },
      },
    ],
  },
  {
    id: "cm8k2n5p6q7r1s0t004",
    status: "DELIVERED",
    total: 1160000,
    notes: null,
    sppgId: "cm8k2n5p6q7r1s0t010",
    supplierId: "cm8k2n5p6q7r1s0t020",
    createdAt: "2026-05-22T08:00:00Z",
    updatedAt: "2026-05-23T14:00:00Z",
    sppg: { id: "cm8k2n5p6q7r1s0t010", name: "SPPG Bandung 01" },
    supplier: { id: "cm8k2n5p6q7r1s0t020", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "cm8k2n5p6q7r1s0t036",
        quantity: 50,
        unitPrice: 12000,
        subtotal: 600000,
        item: { id: "cm8k2n5p6q7r1s0t041", name: "Beras", unit: "kg", basePrice: 12000 },
      },
      {
        id: "cm8k2n5p6q7r1s0t037",
        quantity: 20,
        unitPrice: 28000,
        subtotal: 560000,
        item: { id: "cm8k2n5p6q7r1s0t042", name: "Telur", unit: "kg", basePrice: 28000 },
      },
    ],
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PesananPage() {
  // Map raw backend data ke view model
  const [orders] = useState<OrderViewModel[]>(MOCK_ORDERS_RAW.map(mapOrderFromBackend));
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderViewModel | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<OrderViewModel | null>(null);

  // ============================================================================
  // FUNGSI INI AKAN DIGUNAKAN SAAT INTEGRASI BACKEND
  // ============================================================================
  // const { token, user } = useAuth();
  // const [orders, setOrders] = useState<OrderViewModel[]>([]);
  // const [loading, setLoading] = useState(true);
  //
  // useEffect(() => {
  //   if (token && user?.supplierId) {
  //     fetchOrders();
  //   }
  // }, [token, user]);
  //
  // async function fetchOrders() {
  //   setLoading(true);
  //   try {
  //     const response = await getOrders(token!, user!.supplierId);
  //     if (response.success) {
  //       const rawOrders = response.data.items || [];
  //       setOrders(rawOrders.map(mapOrderFromBackend));
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch orders:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  //
  // async function handleAccept(orderId: string) {
  //   try {
  //     await updateOrderStatus(token!, orderId, "CONFIRMED");
  //     fetchOrders();
  //   } catch (err) {
  //     console.error("Failed to accept order:", err);
  //   }
  // }
  //
  // async function handleReject(orderId: string) {
  //   try {
  //     await updateOrderStatus(token!, orderId, "CANCELLED");
  //     fetchOrders();
  //   } catch (err) {
  //     console.error("Failed to reject order:", err);
  //   }
  // }
  // ============================================================================

  // Mock functions untuk demo
  function handleAccept(orderId: string) {
    alert(`Konfirmasi pesanan ${orderId} (mock)`);
  }

  function handleReject(orderId: string) {
    alert(`Tolak pesanan ${orderId} (mock)`);
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

  const formatItems = (items: OrderViewModel["items"]) => {
    return items.map((item) => `${item.name} ${item.quantity}${item.unit}`).join(", ");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan kelola permintaan logistik dari unit SPPG.
        </p>
      </div>

      {/* Filter Tabs */}
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

      {/* Orders List */}
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
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg text-gray-800">{order.id}</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[order.status].badgeClass}`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{order.sppgName}</p>
                  <p className="text-sm text-gray-500 mt-1">Item: {formatItems(order.items)}</p>
                  <p className="text-xs text-gray-400 mt-2">Dipesan: {formatDate(order.createdAt)}</p>
                </div>

                {/* Action Buttons */}
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
                  {(order.status === "CONFIRMED" || order.status === "CANCELLED") && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
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
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm">
                      {item.name} {item.quantity}{item.unit}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Bukti Pembayaran</h3>
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
                  <p className="text-sm font-medium text-gray-500">bukti_pembayaran.jpg</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk melihat penuh</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 w-full justify-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Eye size={16} /> Lihat Penuh
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download size={16} /> Unduh Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
