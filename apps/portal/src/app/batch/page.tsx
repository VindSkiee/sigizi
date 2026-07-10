'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BatchData {
  batchNumber: string;
  date: string;
  sppg: string;
  menu: string;
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  allergens: string[];
  costPerPortion: number;
  totalCost: number;
  status: string;
  reportKey: string;
}

export default function BatchPage() {
  const searchParams = useSearchParams();
  const batchNumber = searchParams.get('number');
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchNumber) {
      setLoading(false);
      return;
    }

    const fetchBatch = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/public/batch/${batchNumber}`);

        if (!response.ok) {
          throw new Error('Batch tidak ditemukan');
        }

        const result = await response.json();
        setBatch(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchNumber]);

  if (!batchNumber) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Masukkan Nomor Batch
            </h1>
            <p className="text-gray-600 mb-8">
              Format: BATCH-YYYYMMDD-XXX
            </p>
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data batch...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !batch) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Batch Tidak Ditemukan
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'Nomor batch tidak valid atau belum terdaftar'}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Coba Lagi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="text-green-600 hover:text-green-700 font-medium mb-8 inline-block"
          >
            ← Kembali ke Beranda
          </Link>

          {/* Batch Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                📦 {batch.batchNumber}
              </h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {batch.status}
              </span>
            </div>
            <p className="text-gray-500 mb-2">
              {new Date(batch.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">SPPG:</span> {batch.sppg}
            </p>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🍽️ Menu Hari Ini
            </h2>
            <p className="text-lg text-gray-700">{batch.menu}</p>
          </div>

          {/* Nutrition */}
          {batch.nutrition && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📊 Informasi Gizi
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {batch.nutrition.calories}
                  </p>
                  <p className="text-sm text-gray-600">Kalori (kkal)</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {batch.nutrition.protein}g
                  </p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {batch.nutrition.fat}g
                  </p>
                  <p className="text-sm text-gray-600">Lemak</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {batch.nutrition.carbs}g
                  </p>
                  <p className="text-sm text-gray-600">Karbohidrat</p>
                </div>
              </div>
            </div>
          )}

          {/* Allergens */}
          {batch.allergens.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ⚠️ Informasi Alergen
              </h2>
              <div className="flex flex-wrap gap-2">
                {batch.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Jika Anda memiliki alergi terhadap bahan di atas, harap waspada
              </p>
            </div>
          )}

          {/* Cost */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💰 Transparansi Biaya
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya per Porsi</span>
                <span className="font-medium">
                  Rp {batch.costPerPortion.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Biaya Batch</span>
                <span className="font-medium">
                  Rp {batch.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Jumlah Porsi</span>
                <span className="font-medium">
                  {Math.round(batch.totalCost / batch.costPerPortion)} porsi
                </span>
              </div>
            </div>
          </div>

          {/* Complaint Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📝 Laporkan Masalah
            </h2>
            <p className="text-gray-600 mb-4">
              Gunakan kode Report Key untuk melaporkan masalah kualitas makanan
            </p>
            <form
              action={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/complaints`}
              method="POST"
              className="space-y-4"
            >
              <input type="hidden" name="reportKey" value={batch.reportKey || ''} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Report Key
                </label>
                <input
                  type="text"
                  name="reportKeyInput"
                  placeholder="Masukkan kode dari kemasan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Masalah
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Jelaskan masalah yang Anda temui..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Kirim Laporan
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
