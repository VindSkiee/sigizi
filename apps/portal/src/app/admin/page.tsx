"use client";

import { useEffect, useState } from "react";
import { Star, ShoppingCart, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSuppliers } from "@/lib/api";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { AdminStatsCard, AdminStatsGrid } from "@/components/ui/AdminStatsCard";
import "@aejkatappaja/phantom-ui";

const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return "Sangat Baik";
  if (rating >= 3.5) return "Baik";
  if (rating >= 2.5) return "Cukup";
  if (rating >= 1.5) return "Kurang";
  return "Sangat Kurang";
};

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    rating: 4.5,
    totalSuppliers: 0,
  });

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) {
        setStats({ rating: 4.5, totalSuppliers: 0 });
        setLoading(false);
        return;
      }

      try {
        const suppliersRes = await getSuppliers(token).catch(() => null);
        const suppliers =
          suppliersRes?.success && (suppliersRes.data as any)?.items
            ? (suppliersRes.data as any).items
            : [];

        setStats({
          rating: 4.5,
          totalSuppliers: suppliers.length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setStats({ rating: 4.5, totalSuppliers: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-full mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <phantom-ui loading={loading}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {user?.name || "Admin SPPG"}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Berikut ringkasan operasional marketplace hari ini.
          </p>
        </div>

        {/* Stats Cards */}
        <AdminStatsGrid columns={2}>
          {/* Reputasi Vendor */}
          <AdminStatsCard
            title="Reputasi Vendor"
            value={stats.rating.toFixed(1)}
            icon={<Star className="w-5 h-5" />}
            color="yellow"
            subtitle={
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= Math.floor(stats.rating)
                          ? "fill-amber-400 text-amber-400"
                          : star - 0.5 <= stats.rating
                            ? "fill-amber-400/50 text-amber-400"
                            : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {getRatingLabel(stats.rating)}
                </span>
              </div>
            }
          />

          {/* Total Supplier */}
          <AdminStatsCard
            title="Total Supplier"
            value={stats.totalSuppliers}
            unit=" supplier"
            icon={<Store className="w-5 h-5" />}
            color="blue"
          />
        </AdminStatsGrid>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Akses Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              href="/admin/suppliers"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pesanan</p>
                <p className="text-xs text-gray-500">Kelola pesanan ke supplier</p>
              </div>
            </a>
            <a
              href="/admin/reports"
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Laporan Keuangan</p>
                <p className="text-xs text-gray-500">Pengeluaran operasional</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </phantom-ui>
  );
}
