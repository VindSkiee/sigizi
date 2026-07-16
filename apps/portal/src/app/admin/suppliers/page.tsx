"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@sigizi/shared";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, updateOrderStatus } from "@/lib/api";
import {
  SupplierOrder,
  SupplierStats,
  OrderFilterTab,
} from "@/components/features/admin/supplier-integration/types";
import { SupplierStatsCards } from "@/components/features/admin/supplier-integration/SupplierStatsCards";
import { SupplierOrderTabs } from "@/components/features/admin/supplier-integration/SupplierOrderTabs";
import { SupplierSearchBar } from "@/components/features/admin/supplier-integration/SupplierSearchBar";
import { SupplierOrderTable } from "@/components/features/admin/supplier-integration/SupplierOrderTable";
import { SupplierOrderDetailModal } from "@/components/features/admin/supplier-integration/SupplierOrderDetailModal";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 5;

function getSortPriority(order: SupplierOrder): number {
  if (order.status === OrderStatus.CONFIRMED && !order.paidAt) return 1;
  if (order.status === OrderStatus.DELIVERED) return 2;
  if (order.status === OrderStatus.PENDING) return 3;
  if (order.status === OrderStatus.CONFIRMED && order.paidAt) return 4;
  if (order.status === OrderStatus.COMPLETED) return 5;
  if (order.status === "CANCELLED") return 6;
  return 7;
}

function mapApiOrderToSupplierOrder(raw: any): SupplierOrder {
  return {
    id: raw.id,
    status: raw.status,
    total: raw.total,
    notes: raw.notes,
    paidAt: raw.paidAt,
    supplier: raw.supplier
      ? { id: raw.supplier.id, name: raw.supplier.name }
      : { id: "", name: "-" },
    sppg: raw.sppg
      ? { id: raw.sppg.id, name: raw.sppg.name }
      : { id: "", name: "-" },
    items: (raw.items || []).map((i: any) => ({
      id: i.id,
      name: i.item?.name || "-",
      quantity: i.quantity,
      unit: i.item?.unit || "",
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    createdAt: raw.createdAt,
  };
}

export default function SupplierIntegrationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmState, setConfirmState] = useState<{
    orderId: string;
    status: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await getOrders(token);
        if (response.success) {
          const data = response.data as any;
          const items = data?.items || data || [];
          setOrders(
            Array.isArray(items) ? items.map(mapApiOrderToSupplierOrder) : [],
          );
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  // Helper: Check if order is completed or cancelled
  const isCompletedOrCancelled = (status: string) =>
    status === OrderStatus.COMPLETED || status === "CANCELLED";

  const stats: SupplierStats = {
    pendingCount: orders.filter((o) => o.status === OrderStatus.PENDING).length,
    confirmedCount: orders.filter((o) => o.status === OrderStatus.CONFIRMED)
      .length,
    deliveredCount: orders.filter((o) => o.status === OrderStatus.DELIVERED)
      .length,
    completedCount: orders.filter((o) => isCompletedOrCancelled(o.status))
      .length,
    totalActiveValue: orders
      .filter(
        (o) =>
          o.status === OrderStatus.PENDING ||
          o.status === OrderStatus.CONFIRMED ||
          o.status === OrderStatus.DELIVERED,
      )
      .reduce((sum, o) => sum + o.total, 0),
  };

  const counts = {
    all: orders.length,
    pending: stats.pendingCount,
    confirmed: stats.confirmedCount,
    delivered: stats.deliveredCount,
    completed: stats.completedCount,
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // Tab filter
      let matchesTab = false;
      switch (activeTab) {
        case "ALL":
          matchesTab = true;
          break;
        case "SELESAI":
          // Group COMPLETED + CANCELLED
          matchesTab = isCompletedOrCancelled(order.status);
          break;
        default:
          matchesTab = order.status === activeTab;
      }

      // Search filter
      const matchesSearch =
        search === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.supplier?.name.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });

    // Sort by priority only when viewing "ALL"
    if (activeTab === "ALL") {
      result = [...result].sort(
        (a, b) => getSortPriority(a) - getSortPriority(b),
      );
    }

    return result;
  }, [orders, activeTab, search]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleTabChange = (tab: OrderFilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);

    // CONFIRMED → "PAY": navigate directly to payment
    if (order?.status === OrderStatus.CONFIRMED && newStatus === "PAY") {
      router.push(`/admin/payments/${orderId}`);
      return;
    }

    // DELIVERED → COMPLETED: show confirm, then call API
    if (
      order?.status === OrderStatus.DELIVERED &&
      newStatus === OrderStatus.COMPLETED
    ) {
      setConfirmState({ orderId, status: newStatus, label: "Selesai" });
      return;
    }

    // For other transitions, call API directly
    if (!token) return;
    try {
      const response = await updateOrderStatus(token, orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: newStatus as OrderStatus | "CANCELLED" }
              : o,
          ),
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? { ...prev, status: newStatus as OrderStatus | "CANCELLED" }
              : null,
          );
        }
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState || !token) return;

    const { orderId, status } = confirmState;

    // Other confirmed actions: call API
    try {
      const response = await updateOrderStatus(token, orderId, status);
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: status as OrderStatus | "CANCELLED" }
              : o,
          ),
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev
              ? { ...prev, status: status as OrderStatus | "CANCELLED" }
              : null,
          );
        }
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }

    setConfirmState(null);
  };

  const handleViewDetail = (order: SupplierOrder) => {
    setSelectedOrder(order);
  };

  const handleOrderCreated = () => {
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-lg mb-6" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-3 flex-1" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-4">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Daftar Pesanan Bahan Baku
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau pesanan dan kelola tagihan
          supplier di satu tempat.
        </p>
      </div>

      {/* Stats Cards */}
      <SupplierStatsCards stats={stats} />

      {/* Tabs */}
      <SupplierOrderTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* Search Bar */}
      <SupplierSearchBar
        search={search}
        onSearchChange={handleSearchChange}
        onCreateNew={() => router.push("/admin/market")}
      />

      {/* Table */}
      <SupplierOrderTable
        orders={paginatedOrders}
        onViewDetail={handleViewDetail}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Pagination */}
      {filteredOrders.length > 0 && (
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
      )}

      {/* Detail Modal */}
      <SupplierOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState !== null}
        title="Konfirmasi Selesai"
        message="Pesanan akan ditandai sebagai selesai. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Selesai"
        variant="success"
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}
