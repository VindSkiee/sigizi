"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Users,
  Package,
  UtensilsCrossed,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getPublicSppgById } from "@/lib/api";
import { PageErrorBoundary } from "@/components/features/common/PageErrorBoundary";

interface SppgProfile {
  id: string;
  name: string;
  address: string | null;
  province: string;
  regency: string;
  district: string;
  village: string | null;
  latitude: number | null;
  longitude: number | null;
  batchCount: number;
  totalBeneficiary: number;
  totalPortions: number;
  batches: BatchSummary[];
}

interface BatchSummary {
  id: string;
  batchNumber: string;
  date: string;
  menu: string;
  status: string;
  costPerPortion: number;
  totalCost: number;
  beneficiaryCount: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Selesai", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Dibatalkan", color: "bg-gray-100 text-gray-500" },
  FAILED: { label: "Gagal", color: "bg-red-100 text-red-700" },
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SppgProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sppgId = params.id as string;

  const [sppg, setSppg] = useState<SppgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sppgId) return;

    const fetchSppg = async () => {
      try {
        const response = await getPublicSppgById(sppgId);
        setSppg(response.data as SppgProfile);
      } catch {
        setError("SPPG tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };

    fetchSppg();
  }, [sppgId]);

  if (loading) {
    return (
      <PageErrorBoundary pageName="Profil SPPG">
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat data SPPG...</p>
        </div>
      </main>
      </PageErrorBoundary>
    );
  }

  if (error || !sppg) {
    return (
      <PageErrorBoundary pageName="Profil SPPG">
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            SPPG Tidak Ditemukan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {error || "Data SPPG tidak tersedia"}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </main>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Profil SPPG">
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-4 pt-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/sppg"
            className="inline-flex items-center gap-1 text-emerald-100 hover:text-white text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pencarian
          </Link>

          <h1 className="text-2xl font-bold">{sppg.name}</h1>
          <p className="text-emerald-100 text-sm mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {sppg.address ||
              `${sppg.village ? sppg.village + ", " : ""}${sppg.district}, ${sppg.regency}, ${sppg.province}`}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-10 space-y-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sppg.batchCount}
            </p>
            <p className="text-xs text-gray-500">Total Batch</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sppg.totalBeneficiary}
            </p>
            <p className="text-xs text-gray-500">Penerima</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {sppg.totalPortions.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-500">Total Porsi</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Informasi Lokasi
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Provinsi</span>
              <span className="font-medium text-gray-900">{sppg.province}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kabupaten/Kota</span>
              <span className="font-medium text-gray-900">{sppg.regency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kecamatan</span>
              <span className="font-medium text-gray-900">{sppg.district}</span>
            </div>
            {sppg.village && (
              <div className="flex justify-between">
                <span className="text-gray-500">Kelurahan</span>
                <span className="font-medium text-gray-900">
                  {sppg.village}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Batch List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Daftar Batch ({sppg.batches.length})
            </h2>
          </div>

          {sppg.batches.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada batch</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sppg.batches.map((batch) => {
                const status = STATUS_CONFIG[batch.status] ?? {
                  label: batch.status,
                  color: "bg-gray-100 text-gray-500",
                };
                return (
                  <Link
                    key={batch.id}
                    href={`/batch/verify/${batch.batchNumber}`}
                    className="block px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-gray-900">
                            {batch.batchNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {batch.menu}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(batch.date)}
                          {batch.beneficiaryCount
                            ? ` · ${batch.beneficiaryCount} porsi`
                            : ""}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-600 ml-3 whitespace-nowrap">
                        Rp {batch.costPerPortion.toLocaleString("id-ID")}/porsi
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
    </PageErrorBoundary>
  );
}
