"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegionCascadingSelect } from "@/components/ui/RegionCascadingSelect";
import { LocationToggle } from "@/components/ui/LocationToggle";

type Tab = "batch" | "sppg";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("batch");
  const [locationMode, setLocationMode] = useState<"region" | "gps">("region");
  const [batchNumber, setBatchNumber] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [regionFilter, setRegionFilter] = useState<{
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  }>({});

  function handleBatchSearch(e: React.FormEvent) {
    e.preventDefault();
    if (batchNumber.trim()) {
      router.push(`/batch/verify/${encodeURIComponent(batchNumber.trim())}`);
    }
  }

  function handleRegionSearch() {
    const params = new URLSearchParams();
    if (regionFilter.province) params.set("province", regionFilter.province);
    if (regionFilter.regency) params.set("regency", regionFilter.regency);
    if (regionFilter.district) params.set("district", regionFilter.district);
    if (regionFilter.village) params.set("village", regionFilter.village);
    router.push(`/sppg?${params.toString()}`);
  }

  function handleGpsSearch() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          radius: "25",
        });
        setGpsLoading(false);
        router.push(`/sppg?${params.toString()}`);
      },
      () => {
        setGpsLoading(false);
        alert("Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 px-4 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
          >
            Login sebagai SPPG
          </button>
          <button
            onClick={() => router.push("/register")}
            className="relative px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Daftarkan Toko Mu!
            <span className="absolute -top-4 -right-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-orange-500 rounded-full">
              Gratis
            </span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-4">
            SIGIZI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Platform Traceability Makanan MBG
          </p>
          <p className="text-gray-500">
            Pelacakan transparansi gizi dan alergen program Makan Bergizi Gratis
          </p>
        </div>

        {/* Tab Switcher + Content */}
        <div className="max-w-xl mx-auto mb-16">
          {/* Tab Buttons */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("batch")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "batch"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cek Resi
            </button>
            <button
              onClick={() => setActiveTab("sppg")}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "sppg"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cari SPPG
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {activeTab === "batch" ? (
              /* Batch Search */
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                  Cek Resi Batch MBG
                </h2>
                <p className="text-gray-600 mb-6 text-center md:text-sm">
                  Masukkan nomor batch untuk melihat informasi gizi, alergen,
                  dan biaya
                </p>
                <form onSubmit={handleBatchSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="Contoh: BATCH-20260709-001"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Lacak
                  </button>
                </form>
              </div>
            ) : (
              /* SPPG Quick Search */
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                  Cari SPPG
                </h2>
                <p className="text-gray-600 mb-6 text-center md:text-sm">
                  Temukan SPPG terdekat di wilayah Anda
                </p>

                <LocationToggle
                  mode={locationMode}
                  onModeChange={setLocationMode}
                />

                <div className="mt-4">
                  {locationMode === "region" ? (
                    <>
                      <RegionCascadingSelect
                        onSelect={setRegionFilter}
                        value={regionFilter}
                      />
                      <button
                        onClick={handleRegionSearch}
                        disabled={!regionFilter.province}
                        className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Cari Berdasarkan Region
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Gunakan lokasi GPS Anda untuk menemukan SPPG terdekat
                      </p>
                      <button
                        onClick={handleGpsSearch}
                        disabled={gpsLoading}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                      >
                        {gpsLoading
                          ? "Mencari lokasi..."
                          : "Gunakan Lokasi Saya"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Informasi Gizi</h3>
            <p className="text-gray-600 text-sm">
              Lihat detail kalori, protein, lemak, dan karbohidrat setiap
              makanan
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Deteksi Alergen</h3>
            <p className="text-gray-600 text-sm">
              Kenali bahan yang dapat memicu alergi sebelum mengonsumsi
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Lapor Komplain</h3>
            <p className="text-gray-600 text-sm">
              Sampaikan keluhan dengan valid menggunakan kode Report Key
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>SIGIZI - Platform GovTech untuk Program Makan Bergizi Gratis</p>
          <p className="mt-1">Dikembangkan oleh TraceBite</p>
        </div>
      </div>
    </main>
  );
}
