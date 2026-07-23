"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegionCascadingSelect } from "@/components/ui/RegionCascadingSelect";
import { LocationToggle } from "@/components/ui/LocationToggle";
import { DemoNoticeModal } from "@/components/ui/DemoNoticeModal";
import ErrorTooltip from "@/components/ui/ErrorTooltip";

type Tab = "batch" | "sppg";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("batch");
  const [locationMode, setLocationMode] = useState<"region" | "gps">("region");
  const [batchNumber, setBatchNumber] = useState("");
  const [batchError, setBatchError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [regionFilter, setRegionFilter] = useState<{
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  }>({});

  function handleBatchSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!batchNumber.trim()) {
      setBatchError("Nomor batch wajib diisi");
      return;
    }
    setBatchError("");
    router.push(`/batch/verify/${encodeURIComponent(batchNumber.trim())}`);
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
      <DemoNoticeModal />
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 px-4 py-3 md:py-4">
        <div className="max-w-5xl mx-auto flex justify-end items-center gap-2 md:gap-3">
          <button
            onClick={() => router.push("/auth/login")}
            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Masuk
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="relative px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Daftar Supplier
            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold text-white bg-orange-500 rounded-full">
              Gratis!
            </span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 mt-4 md:mt-0">
          <img
            src="/logo.png"
            alt="SIGIZI"
            className="h-12 md:h-20 mx-auto mb-3 md:mb-4"
          />
          <p className="text-lg md:text-2xl font-medium text-gray-700 mb-1 md:mb-2">
            Platform Traceability Makanan MBG
          </p>
          <p className="text-xs md:text-sm text-gray-500 max-w-sm md:max-w-none mx-auto">
            Pelacakan transparansi gizi dan alergen program Makan Bergizi Gratis
          </p>
        </div>

        {/* Tab Switcher + Content */}
        <div className="max-w-xl mx-auto mb-12 md:mb-16">
          {/* Tab Buttons */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5 md:mb-6">
            <button
              onClick={() => setActiveTab("batch")}
              className={`flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeTab === "batch"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cek Resi
            </button>
            <button
              onClick={() => setActiveTab("sppg")}
              className={`flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeTab === "sppg"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cari SPPG
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-lg p-5 md:p-8">
            {activeTab === "batch" ? (
              /* Batch Search */
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1 md:mb-2 text-center">
                  Cek Resi Batch MBG
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mb-5 md:mb-6 text-center">
                  Masukkan nomor batch untuk melihat informasi gizi, alergen,
                  dan biaya
                </p>
                {/* Form layout: Stack di mobile, sebaris di sm (tablet/desktop) */}
                <form
                  onSubmit={handleBatchSearch}
                  noValidate
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <ErrorTooltip error={batchError}>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => {
                        setBatchNumber(e.target.value);
                        if (batchError) setBatchError("");
                      }}
                      placeholder="Contoh: BATCH-20260709-001"
                      className="w-full sm:flex-1 px-4 py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </ErrorTooltip>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-sm md:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Lacak
                  </button>
                </form>
              </div>
            ) : (
              /* SPPG Quick Search */
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1 md:mb-2 text-center">
                  Cari SPPG
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mb-5 md:mb-6 text-center">
                  Temukan SPPG terdekat di wilayah Anda
                </p>

                <LocationToggle
                  mode={locationMode}
                  onModeChange={setLocationMode}
                />

                <div className="mt-4 md:mt-5">
                  {locationMode === "region" ? (
                    <>
                      <RegionCascadingSelect
                        onSelect={setRegionFilter}
                        value={regionFilter}
                      />
                      <button
                        onClick={handleRegionSearch}
                        disabled={!regionFilter.province}
                        className="w-full mt-4 px-6 py-3 bg-green-600 text-white text-sm md:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Cari Berdasarkan Region
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8 text-green-600"
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
                      <p className="text-xs md:text-sm text-gray-600 mb-4 px-4">
                        Gunakan lokasi GPS Anda untuk menemukan SPPG terdekat
                      </p>
                      <button
                        onClick={handleGpsSearch}
                        disabled={gpsLoading}
                        className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-sm md:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          <div className="group relative bg-white rounded-xl border border-gray-200 p-5 md:p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                  Informasi Gizi
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  Detail kalori, protein, lemak, dan karbohidrat setiap makanan
                  secara transparan
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl border border-gray-200 p-5 md:p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                  Deteksi Alergen
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  Kenali bahan pemicu alergi sebelum mengonsumsi untuk keamanan
                  pangan
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl border border-gray-200 p-5 md:p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 sm:col-span-2 md:col-span-1">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1">
                  Lapor Komplain
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                  Sampaikan keluhan dengan valid menggunakan kode Report Key
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 text-center text-gray-500 text-xs md:text-sm">
          <p>SIGIZI - Platform GovTech untuk Program Makan Bergizi Gratis</p>
          <p className="mt-1">Dikembangkan oleh TraceBite</p>
        </div>
      </div>
    </main>
  );
}
