"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageErrorBoundary } from "@/components/features/PageErrorBoundary";

// 1. Pisahkan logika ke komponen Content
function BatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchNumber = searchParams.get("number");

  useEffect(() => {
    if (batchNumber) {
      router.replace(`/batch/verify/${encodeURIComponent(batchNumber)}`);
    }
  }, [batchNumber, router]);

  if (!batchNumber) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Masukkan Nomor Batch
            </h1>
            <p className="text-gray-600 mb-8">Format: BATCH-YYYYMMDD-XXX</p>
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Mengalihkan ke halaman batch...</p>
      </div>
    </main>
  );
}

// 2. Halaman utama hanya bertugas merender Suspense + Error Boundary
export default function BatchPage() {
  return (
    <PageErrorBoundary pageName="Pencarian Batch">
      <Suspense 
        fallback={
          <main className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          </main>
        }
      >
        <BatchContent />
      </Suspense>
    </PageErrorBoundary>
  );
}