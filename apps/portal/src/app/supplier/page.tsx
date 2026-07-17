"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getOrders, getSupplierItems } from "@/lib/api";
import {
  ClipboardList,
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/features/supplier/StatsCard";

interface RecentOrder {
  id: string;
  sppgName: string;
  items: string;
  total: number;
  status: string;
  createdAt: string;
}

interface CatalogSummary {
  total: number;
  available: number;
  unavailable: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "Dikirim", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4 text-yellow-500" />,
  CONFIRMED: <CheckCircle className="w-4 h-4 text-blue-500" />,
  DELIVERED: <Truck className="w-4 h-4 text-purple-500" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-green-500" />,
  CANCELLED: <XCircle className="w-4 h-4 text-red-500" />,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function SupplierDashboardPage() {
  const { token, user } = useAuth();
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const showMouCard = process.env.NEXT_PUBLIC_DEMO_MODE !== "true";

  const fetchRecentOrders = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getOrders(token);
      if (response.success) {
        const data = response.data as any;
        const items = data?.items || data || [];
        if (Array.isArray(items)) {
          setAllOrders(items);

          // Pesanan terbaru: filter hanya hari ini
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayOrders = items.filter((o: any) => {
            const orderDate = new Date(o.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          });

          const mapped: RecentOrder[] = todayOrders
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 3)
            .map((o: any) => ({
              id: o.id,
              sppgName: o.sppg?.name || "SPPG",
              items: (o.items || [])
                .slice(0, 2)
                .map(
                  (i: any) =>
                    `${i.item?.name || "Item"} ${i.quantity}${i.item?.unit || ""}`,
                )
                .join(", "),
              total: o.total || 0,
              status: o.status,
              createdAt: o.createdAt,
            }));
          setRecentOrders(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  const fetchCatalog = useCallback(async () => {
    if (!token || !user?.supplierId) return;
    try {
      const response = await getSupplierItems(token, user.supplierId);
      if (response.success) {
        const items = (response.data as any) || [];
        if (Array.isArray(items)) {
          setCatalog({
            total: items.length,
            available: items.filter((i: any) => i.isAvailable).length,
            unavailable: items.filter((i: any) => !i.isAvailable).length,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchRecentOrders();
    fetchCatalog();
  }, [fetchRecentOrders, fetchCatalog]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Selamat Datang, {user?.name || "Supplier"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Berikut ringkasan aktivitas operasional Anda hari ini.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">
              Data diperbarui secara real-time
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* Grid disesuaikan dengan kondisi showMouCard (4 kolom jika true, 3 kolom jika false) */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showMouCard ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        <StatsCard
          title="Total Produk"
          value={catalog?.total ?? 0}
          icon={<Package className="w-6 h-6" />}
          loading={loadingCatalog}
        />
        <StatsCard
          title="Pengiriman Berhasil"
          value={allOrders.filter((o) => o.status === "COMPLETED").length}
          icon={<Truck className="w-6 h-6" />}
          loading={loadingOrders}
        />
        <StatsCard
          title="Pesanan Masuk"
          value={allOrders.filter((o) => o.status === "PENDING").length}
          icon={<ClipboardList className="w-6 h-6" />}
          loading={loadingOrders}
        />

        {/* Render Card MoU Aktif jika environment valid */}
        {showMouCard && (
          <StatsCard
            title="MoU Aktif"
            value={3}
            icon={<FileText className="w-6 h-6" />}
          />
        )}
      </div>

      {/* 2 Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Pesanan Terbaru */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Pesanan Hari Ini</h3>
            </div>
            <Link
              href="/supplier/pesanan"
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {loadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Belum ada pesanan hari ini
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                        {STATUS_ICON[order.status] || (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {order.sppgName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {order.items || "Tidak ada item"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            statusInfo.color,
                          )}
                        >
                          {statusInfo.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Ringkasan Katalog */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Ringkasan Katalog</h3>
            </div>
            <Link
              href="/supplier/katalog"
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              Kelola
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {loadingCatalog ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !catalog ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Gagal memuat katalog</p>
              </div>
            ) : (
              <>
                {/* Total Produk */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">
                      {catalog.total}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Produk
                    </p>
                    <p className="text-xs text-gray-400">
                      Semua produk yang terdaftar
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-2xl font-bold text-green-600">
                      {catalog.available}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Tersedia</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-2xl font-bold text-gray-500">
                      {catalog.unavailable}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Tidak Tersedia</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
