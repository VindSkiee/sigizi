"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { ClipboardList, Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  OrderViewModel,
  FilterType,
  Order,
} from "@/components/features/supplier/orders/types";
import { OrderTabs } from "@/components/features/supplier/orders/OrderTabs";
import { OrderCard } from "@/components/features/supplier/orders/OrderCard";
import { OrderDetailModal } from "@/components/features/supplier/orders/OrderDetailModal";
import { RejectModal } from "@/components/features/supplier/orders/RejectModal";

const ITEMS_PER_PAGE = 5;

function getSortPriority(order: OrderViewModel): number {
  if (order.status === "PENDING") return 1;
  if (order.status === "CONFIRMED" && order.paidAt) return 2;
  if (order.status === "DELIVERED") return 3;
  if (order.status === "CONFIRMED" && !order.paidAt) return 4;
  if (order.status === "COMPLETED") return 5;
  if (order.status === "CANCELLED") return 6;
  return 7;
}

function formatProvince(raw: string): string {
  return raw
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatAddress(sppg: Order["sppg"]): string {
  const parts: string[] = [];
  if (sppg.address) parts.push(sppg.address);
  if (sppg.regency) parts.push(`Kab. ${formatProvince(sppg.regency)}`);
  if (sppg.district) parts.push(`Kec. ${formatProvince(sppg.district)}`);
  if (sppg.village) parts.push(`Kel. ${sppg.village}`);
  if (sppg.province) parts.push(formatProvince(sppg.province));
  return parts.join(", ") || "-";
}

function mapOrderFromBackend(raw: Order): OrderViewModel {
  return {
    id: raw.id,
    sppgName: raw.sppg?.name || "SPPG",
    sppgAddress: raw.sppg ? formatAddress(raw.sppg) : "-",
    supplierName: raw.supplier?.name || "Supplier",
    supplierLat: raw.supplier?.latitude ?? null,
    supplierLng: raw.supplier?.longitude ?? null,
    sppgLat: raw.sppg?.latitude ?? null,
    sppgLng: raw.sppg?.longitude ?? null,
    cancelledReason: raw.cancelledReason,
    paidAt: raw.paidAt,
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

export default function PesananPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderViewModel | null>(
    null,
  );
  const [rejectingOrder, setRejectingOrder] = useState<OrderViewModel | null>(
    null,
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "danger";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "success",
    onConfirm: () => {},
  });

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getOrders(token);
      if (response.success) {
        const data = response.data as any;
        const items = data?.items || data || [];
        setOrders(Array.isArray(items) ? items.map(mapOrderFromBackend) : []);
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
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.sppgName.toLowerCase().includes(query) ||
          o.items.some((item) => item.name.toLowerCase().includes(query)),
      );
    }
    // Sort by priority only when viewing "all"
    if (filter === "all") {
      result = [...result].sort(
        (a, b) => getSortPriority(a) - getSortPriority(b),
      );
    }
    return result;
  }, [orders, filter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  function handleFilterChange(newFilter: FilterType) {
    setFilter(newFilter);
  }

  function handleAccept(orderId: string) {
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Pesanan",
      message: "Apakah Anda yakin ingin mengkonfirmasi pesanan ini?",
      variant: "success",
      onConfirm: () => confirmAcceptOrder(orderId),
    });
  }

  async function confirmAcceptOrder(orderId: string) {
    if (!token) return;

    setUpdatingId(orderId);
    try {
      await updateOrderStatus(token, orderId, "CONFIRMED");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CONFIRMED" as const } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to confirm order:", err);
      alert("Gagal mengkonfirmasi pesanan");
    } finally {
      setUpdatingId(null);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  }

  async function handleReject(orderId: string, reason: string) {
    if (!token) return;

    setUpdatingId(orderId);
    try {
      await updateOrderStatus(token, orderId, "CANCELLED", reason);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "CANCELLED" as const } : o,
        ),
      );
      setRejectingOrder(null);
    } catch (err) {
      console.error("Failed to reject order:", err);
      alert("Gagal menolak pesanan");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleMarkDelivered(orderId: string) {
    setConfirmModal({
      isOpen: true,
      title: "Tandai Dikirim",
      message: "Tandai pesanan sebagai sudah dikirim?",
      variant: "success",
      onConfirm: () => confirmMarkDelivered(orderId),
    });
  }

  async function confirmMarkDelivered(orderId: string) {
    if (!token) return;

    setUpdatingId(orderId);
    try {
      await updateOrderStatus(token, orderId, "DELIVERED");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "DELIVERED" as const } : o,
        ),
      );
    } catch (err) {
      console.error("Failed to mark delivered:", err);
      alert("Gagal menandai pengiriman");
    } finally {
      setUpdatingId(null);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-10 bg-gray-200 rounded max-w-md" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Daftar Pesanan Masuk
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan kelola permintaan logistik dari unit SPPG.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama SPPG atau item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <OrderTabs
        activeFilter={filter}
        orders={orders.map((o) => ({ ...o, status: o.status as any }))}
        onFilterChange={handleFilterChange}
      />

      {paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada pesanan</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery
              ? "Tidak ada pesanan yang sesuai dengan pencarian"
              : "Belum ada pesanan masuk saat ini"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order, idx) => (
              <OrderCard
                key={`${order.id}-${idx}`}
                order={order}
                onAccept={handleAccept}
                onReject={(id) => setRejectingOrder(order)}
                onMarkDelivered={handleMarkDelivered}
                onViewDetail={setSelectedOrder}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">
              Menampilkan {startIndex + 1}-
              {Math.min(endIndex, filteredOrders.length)} dari{" "}
              {filteredOrders.length} pesanan
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {rejectingOrder && (
        <RejectModal
          orderNumber={rejectingOrder.id}
          onConfirm={(reason) => handleReject(rejectingOrder.id, reason)}
          onClose={() => setRejectingOrder(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={
          confirmModal.variant === "success" ? "Ya, Konfirmasi" : "Ya, Hapus"
        }
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
