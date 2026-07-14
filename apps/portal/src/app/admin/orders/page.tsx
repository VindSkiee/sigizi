"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { ClipboardList, Search, CheckCircle, XCircle, Package } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
type FilterType = "all" | OrderStatus;

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  item: { id: string; name: string; unit: string };
}

interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  sppg: { id: string; name: string };
  supplier: { id: string; name: string };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderViewModel {
  id: string;
  orderNumber: string;
  sppgName: string;
  supplierName: string;
  items: { id: string; name: string; quantity: number; unit: string; subtotal: number }[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: string }> = {
  PENDING: { label: "Menunggu Konfirmasi", className: "bg-yellow-100 text-yellow-700", icon: "⏳" },
  CONFIRMED: { label: "Dikonfirmasi", className: "bg-blue-100 text-blue-700", icon: "✅" },
  DELIVERED: { label: "Dikirim", className: "bg-purple-100 text-purple-700", icon: "📦" },
  COMPLETED: { label: "Selesai", className: "bg-green-100 text-green-700", icon: "✔️" },
  CANCELLED: { label: "Dibatalkan", className: "bg-red-100 text-red-700", icon: "❌" },
};

const ITEMS_PER_PAGE = 10;

function mapOrderToViewModel(order: Order): OrderViewModel {
  return {
    id: order.id,
    orderNumber: `ORD-${order.id.slice(-6).toUpperCase()}`,
    sppgName: order.sppg?.name || "-",
    supplierName: order.supplier?.name || "-",
    items: order.items.map((i) => ({
      id: i.id,
      name: i.item?.name || "-",
      quantity: i.quantity,
      unit: i.item?.unit || "",
      subtotal: i.subtotal,
    })),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getOrders(token);
      if (response.success) {
        const data = response.data as any;
        const items = data?.items || data || [];
        setOrders(Array.isArray(items) ? items.map(mapOrderToViewModel) : []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.sppgName.toLowerCase().includes(q) ||
          o.supplierName.toLowerCase().includes(q) ||
          o.items.some((item) => item.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, filter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    if (!token) return;
    const statusLabels: Record<OrderStatus, string> = {
      PENDING: "konfirmasi",
      CONFIRMED: "dikirim",
      DELIVERED: "selesai",
      COMPLETED: "selesai",
      CANCELLED: "batalkan",
    };
    const confirmed = window.confirm(`Yakin ingin ${statusLabels[newStatus]} pesanan ini?`);
    if (!confirmed) return;

    setUpdatingId(orderId);
    try {
      await updateOrderStatus(token, orderId, newStatus, notes);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Gagal memperbarui status pesanan");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextAction = (status: OrderStatus): { label: string; nextStatus: OrderStatus; className: string } | null => {
    switch (status) {
      case "DELIVERED":
        return { label: "Tandai Selesai", nextStatus: "COMPLETED", className: "bg-green-600 hover:bg-green-700" };
      case "PENDING":
        return { label: "Batalkan", nextStatus: "CANCELLED", className: "bg-red-600 hover:bg-red-700" };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan kelola semua pesanan dari unit SPPG ke supplier.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari ID Pesanan / SPPG / Supplier / Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "PENDING", "CONFIRMED", "DELIVERED", "COMPLETED", "CANCELLED"] as FilterType[]).map(
          (f) => {
            const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "Semua" : STATUS_CONFIG[f].label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          }
        )}
      </div>

      {/* Orders Table */}
      {paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada pesanan</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Tidak ada pesanan yang sesuai pencarian" : "Belum ada pesanan"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      ID Pesanan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      SPPG
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const action = getNextAction(order.status);
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{order.sppgName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{order.supplierName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">
                            {order.items.length} item
                            <span className="text-gray-400 ml-1">
                              ({order.items.map((i) => i.name).join(", ")})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status].className}`}
                          >
                            {STATUS_CONFIG[order.status].icon} {STATUS_CONFIG[order.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {action && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, action.nextStatus)}
                              disabled={updatingId === order.id}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${action.className}`}
                            >
                              {updatingId === order.id ? (
                                <span className="animate-spin">⟳</span>
                              ) : action.nextStatus === "COMPLETED" ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              {action.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">
              Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} dari{" "}
              {filteredOrders.length} pesanan
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </div>
  );
}
