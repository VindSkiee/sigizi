"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  UtensilsCrossed,
  Truck,
  Clock,
  Flag,
  FlaskConical,
  Receipt,
} from "lucide-react";
import {
  ComplaintPinModal,
  ComplaintFormModal,
  ComplaintSuccessModal,
  useDailyPin,
} from "@/components/features/complaint";

interface BatchItem {
  name: string | null;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface BatchData {
  batchNumber: string;
  date: string;
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
  costPerPortionStandard: number;
  totalBudget: number;
  budgetVariance: number | null;
  beneficiaryCount: number | null;
  status: string;
  reportKey: string;
  batchItems: BatchItem[];
  sppg: {
    name: string;
    address: string | null;
  };
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return (
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BatchVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const batchNumber = params.batchNumber as string;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPinModal, setShowPinModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const dailyPin = useDailyPin();

  useEffect(() => {
    if (!batchNumber) {
      setLoading(false);
      return;
    }

    const fetchBatch = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(
          `${apiUrl}/api/batches/by-number/${batchNumber}`,
        );

        if (!response.ok) {
          throw new Error("Batch tidak ditemukan");
        }

        const result = await response.json();
        setBatch(result.data);
      } catch {
        setError("Batch tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchNumber]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat data batch...</p>
        </div>
      </main>
    );
  }

  if (error || !batch) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Batch Tidak Ditemukan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {error || "Nomor batch tidak valid atau belum terdaftar"}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-white pb-8"
      style={{
        backgroundImage: "url('/batch_detail_bg.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px",
      }}
    >
      {/* Green Header */}
      <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white px-5 pt-4 pb-12 text-center relative">
        <div className="max-w-3xl mx-auto relative">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-9 h-9 text-white" />
            </div>
            <p className="text-xs uppercase tracking-widest text-emerald-100 mb-1">
              Distribusi Terverifikasi
            </p>
            <h1 className="text-xl font-bold">Batch #{batch.batchNumber}</h1>
            <p className="text-sm text-emerald-100 mt-1">
              {formatDate(batch.date)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-10 space-y-4">
        {/* Info Box */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Diproduksi Oleh
            </p>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {batch.sppg.name}
            </p>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <ShieldCheck className="w-3 h-3" />
              Vendor Resmi BGN
            </div>
          </div>

          <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1 text-gray-400 mb-0.5">
                <Truck className="w-3 h-3" />
                <span className="text-xs">Tujuan</span>
              </div>
              <p className="font-medium text-gray-900">
                {batch.sppg.address || "-"}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-400 mb-0.5 justify-end">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Waktu Masak</span>
              </div>
              <p className="font-medium text-gray-900">
                {formatTime(batch.date)}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Menu Hari Ini
            </h2>
          </div>

          {batch.batchItems.length > 0 ? (
            <div className="space-y-0">
              {batch.batchItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-emerald-700 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-gray-800">
                      {item.name || `Item ${index + 1}`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Rp {item.unitPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}

              <div className="border-t border-dashed border-gray-200 mt-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    TOTAL PER PORSI
                  </span>
                  <span className="text-base font-bold text-emerald-600">
                    Rp {batch.costPerPortion.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {batch.menu || "Menu tidak tersedia"}
            </p>
          )}
        </div>

        {/* Nutrition Section */}
        {batch.nutrition && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Informasi Gizi
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">
                  {batch.nutrition.calories}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Kalori (kkal)</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">
                  {batch.nutrition.protein}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Protein</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-600">
                  {batch.nutrition.fat}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Lemak</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-600">
                  {batch.nutrition.carbs}g
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Karbohidrat</p>
              </div>
            </div>
          </div>
        )}

        {/* Allergen Warning */}
        {batch.allergens && batch.allergens.length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-red-700">
                PERINGATAN ALERGI
              </h3>
            </div>
            <p className="text-sm text-red-600 mb-2">Menu ini mengandung:</p>
            <div className="flex flex-wrap gap-2">
              {batch.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-red-200 text-red-700 rounded-full text-xs font-medium"
                >
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transparansi Biaya */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Transparansi Biaya
            </h2>
          </div>

          <div className="space-y-3">
            {batch.beneficiaryCount != null && (
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-500">Anggaran BGN</p>
                  <p className="text-xs text-gray-400">
                    {batch.beneficiaryCount} porsi × Rp{" "}
                    {batch.costPerPortionStandard.toLocaleString("id-ID")}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  Rp {batch.totalBudget.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-gray-500">Biaya Aktual (Bahan)</p>
                <p className="text-xs text-gray-400">
                  Total harga bahan yang digunakan
                </p>
              </div>
              <span className="font-semibold text-gray-900">
                Rp {batch.totalCost.toLocaleString("id-ID")}
              </span>
            </div>

            {batch.budgetVariance != null && (
              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                <div>
                  <p className="text-gray-500">Selisih</p>
                  <p className="text-xs text-gray-400">
                    {batch.budgetVariance <= 0
                      ? "Hemat dari anggaran"
                      : "Melebihi anggaran"}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    batch.budgetVariance <= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {batch.budgetVariance <= 0 ? "" : "+"}Rp{" "}
                  {batch.budgetVariance.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
              <div>
                <p className="text-gray-500">Biaya per Porsi</p>
                <p className="text-xs text-gray-400">
                  Standar BGN: Rp{" "}
                  {batch.costPerPortionStandard.toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`font-semibold ${
                  batch.costPerPortion <= batch.costPerPortionStandard
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                Rp {batch.costPerPortion.toLocaleString("id-ID")}/porsi
              </span>
            </div>
          </div>
        </div>

        {/* Report Button */}
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
        >
          <Flag className="w-5 h-5" />
          Laporkan Masalah Makanan
        </button>

        {/* Footer Text */}
        <div className="text-center px-4 pt-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            Makanan ini disubsidi oleh program Makan Bergizi Gratis (MBG)
            <br />
            Pemerintah Republik Indonesia.
          </p>
        </div>
      </div>

      {/* Complaint Modals */}
      <ComplaintPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerified={() => {
          setShowPinModal(false);
          setShowFormModal(true);
        }}
        correctPin={dailyPin}
      />

      <ComplaintFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmitSuccess={() => {
          setShowFormModal(false);
          setShowSuccessModal(true);
        }}
        reportKey={batch.reportKey}
        batchNumber={batch.batchNumber}
      />

      <ComplaintSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </main>
  );
}
