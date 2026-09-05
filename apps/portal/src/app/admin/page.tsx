"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Store, ReceiptText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSuppliers, getOrders, getTransactions } from "@/lib/api";
import { DashboardStatsCards } from "@/components/features/admin/dashboard/DashboardStatsCards";
import { OrderStatusSummary } from "@/components/features/admin/dashboard/OrderStatusSummary";
import { RecentTransactions } from "@/components/features/admin/dashboard/RecentTransactions";
import type {
  DashboardStats,
  RecentTransaction,
} from "@/components/features/admin/dashboard/types";

function get7DayRange() {
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  return { start: s, end };
}

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const range = get7DayRange();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    totalOrders: 0,
    totalSpend: 0,
    orderStatusCounts: {},
  });
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const [suppliersRes, ordersRes, transactionsRes] = await Promise.all([
        getSuppliers(token).catch(() => null),
        getOrders(token).catch(() => null),
        getTransactions(token, {
          startDate: range.start,
          endDate: range.end,
          limit: 5,
        }).catch(() => null),
      ]);

      // Suppliers
      const suppliersData =
        suppliersRes?.success && (suppliersRes.data as any)?.items
          ? (suppliersRes.data as any).items
          : [];
      const totalSuppliers = suppliersData.length;

      // Orders
      const ordersData =
        ordersRes?.success && (ordersRes.data as any)?.items
          ? (ordersRes.data as any).items
          : [];
      const totalOrders = ordersData.length;
      const totalSpend = ordersData.reduce(
        (sum: number, o: any) => sum + (o.total ?? 0),
        0,
      );

      const orderStatusCounts: Record<string, number> = {};
      ordersData.forEach((o: any) => {
        const status = o.status ?? "UNKNOWN";
        orderStatusCounts[status] = (orderStatusCounts[status] ?? 0) + 1;
      });

      setStats({
        totalSuppliers,
        totalOrders,
        totalSpend,
        orderStatusCounts,
      });

      // Recent transactions
      const txData =
        transactionsRes?.success && (transactionsRes.data as any)?.items
          ? (transactionsRes.data as any).items
          : [];
      setRecentTransactions(txData.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [token, range.start, range.end]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.name || "Admin SPPG"}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Berikut ringkasan operasional marketplace hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} loading={loading} />

      {/* Order Status */}
      <OrderStatusSummary stats={stats} loading={loading} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} loading={loading} />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/admin/suppliers"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Keranjang Pesanan</p>
              <p className="text-xs text-gray-500">Kelola pesanan ke supplier</p>
            </div>
          </a>
          <a
            href="/admin/market"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Pasar Bahan Baku</p>
              <p className="text-xs text-gray-500">Cari & bandingkan harga</p>
            </div>
          </a>
          <a
            href="/admin/transactions"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ReceiptText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Riwayat Transaksi</p>
              <p className="text-xs text-gray-500">Lihat riwayat pembelian</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
