"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@sigizi/shared";
import {
  SupplierOrder,
  SupplierStats,
  OrderFilterTab,
} from "@/components/features/admin/supplier-integration/types";
import { MOCK_ORDERS } from "@/components/features/admin/supplier-integration/mockData";
import { SupplierStatsCards } from "@/components/features/admin/supplier-integration/SupplierStatsCards";
import { SupplierOrderTabs } from "@/components/features/admin/supplier-integration/SupplierOrderTabs";
import { SupplierSearchBar } from "@/components/features/admin/supplier-integration/SupplierSearchBar";
import { SupplierOrderTable } from "@/components/features/admin/supplier-integration/SupplierOrderTable";
import { SupplierOrderDetailModal } from "@/components/features/admin/supplier-integration/SupplierOrderDetailModal";
import { Pagination } from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 5;

export default function SupplierIntegrationPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<SupplierOrder[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const stats: SupplierStats = {
    pendingCount: orders.filter((o) => o.status === OrderStatus.PENDING)
      .length,
    deliveredCount: orders.filter((o) => o.status === OrderStatus.DELIVERED)
      .length,
    completedCount: orders.filter((o) => o.status === OrderStatus.COMPLETED)
      .length,
    totalActiveValue: orders
      .filter(
        (o) =>
          o.status === OrderStatus.PENDING ||
          o.status === OrderStatus.DELIVERED
      )
      .reduce((sum, o) => sum + o.total, 0),
  };

  const counts = {
    all: orders.filter((o) => o.status !== OrderStatus.CONFIRMED).length,
    pending: stats.pendingCount,
    delivered: stats.deliveredCount,
    completed: stats.completedCount,
  };

  const filteredOrders = orders
    .filter((order) => order.status !== OrderStatus.CONFIRMED)
    .filter((order) => {
      const matchesTab =
        activeTab === "ALL" || order.status === activeTab;
      const matchesSearch =
        search === "" ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.supplier?.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });

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

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus as OrderStatus }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: newStatus as OrderStatus }
          : null
      );
    }
  };

  const handleViewDetail = (order: SupplierOrder) => {
    setSelectedOrder(order);
  };

  const handleOrderCreated = () => {
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Supplier & Bahan Baku
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau pesanan, validasi Quality Control (QC), dan kelola tagihan
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
        onCreateNew={() => router.push("/admin/suppliers/create")}
      />

      {/* Table */}
      <SupplierOrderTable
        orders={paginatedOrders}
        onViewDetail={handleViewDetail}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} dari {filteredOrders.length} pesanan
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
    </div>
  );
}
