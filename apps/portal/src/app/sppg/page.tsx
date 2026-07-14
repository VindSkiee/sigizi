"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Package,
  Users,
  Search,
  Loader2,
} from "lucide-react";
import { RegionCascadingSelect } from "@/components/ui/RegionCascadingSelect";
import { LocationToggle } from "@/components/ui/LocationToggle";
import { searchPublicSppg, type PublicSppgSearchParams } from "@/lib/api";

interface SppgListItem {
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
  distanceKm?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function SppgSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [locationMode, setLocationMode] = useState<"region" | "gps">(
    searchParams.get("lat") ? "gps" : "region",
  );
  const [results, setResults] = useState<SppgListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Region state
  const [regionFilter, setRegionFilter] = useState<{
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  }>({
    province: searchParams.get("province") ?? undefined,
    regency: searchParams.get("regency") ?? undefined,
    district: searchParams.get("district") ?? undefined,
    village: searchParams.get("village") ?? undefined,
  });

  // GPS state
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) return { lat: parseFloat(lat), lng: parseFloat(lng) };
    return null;
  });
  const [radiusKm, setRadiusKm] = useState<number>(
    parseInt(searchParams.get("radius") ?? "25", 10),
  );
  const [gpsLoading, setGpsLoading] = useState(false);

  const doSearch = useCallback(async (params: PublicSppgSearchParams) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchPublicSppg(params);
      const data = response.data as {
        items: SppgListItem[];
        pagination: Pagination;
      };
      setResults(data.items);
      setPagination(data.pagination);
    } catch {
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search from URL params on mount
  useEffect(() => {
    const params: PublicSppgSearchParams = {};
    const province = searchParams.get("province");
    const regency = searchParams.get("regency");
    const district = searchParams.get("district");
    const village = searchParams.get("village");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");

    if (province) params.province = province;
    if (regency) params.regency = regency;
    if (district) params.district = district;
    if (village) params.village = village;
    if (lat && lng) {
      params.latitude = parseFloat(lat);
      params.longitude = parseFloat(lng);
      params.radiusKm = radius ? parseInt(radius, 10) : 25;
    }

    if (Object.keys(params).length > 0) {
      doSearch(params);
    }
  }, [searchParams, doSearch]);

  function handleRegionSearch() {
    if (!regionFilter.province) return;
    const params: PublicSppgSearchParams = {
      province: regionFilter.province,
      regency: regionFilter.regency,
      district: regionFilter.district,
      village: regionFilter.village,
    };
    doSearch(params);
  }

  function handleGpsSearch() {
    if (!gpsCoords) return;
    doSearch({
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      radiusKm,
    });
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        alert("Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  function handlePageChange(page: number) {
    const params: PublicSppgSearchParams = { page };
    if (locationMode === "region") {
      if (regionFilter.province) params.province = regionFilter.province;
      if (regionFilter.regency) params.regency = regionFilter.regency;
      if (regionFilter.district) params.district = regionFilter.district;
      if (regionFilter.village) params.village = regionFilter.village;
    } else if (gpsCoords) {
      params.latitude = gpsCoords.lat;
      params.longitude = gpsCoords.lng;
      params.radiusKm = radiusKm;
    }
    doSearch(params);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Cari SPPG</h1>
          <p className="text-gray-500 text-sm mt-1">
            Temukan Satuan Pelaksana Pemberian Makanan Gratis di seluruh
            Indonesia
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <LocationToggle mode={locationMode} onModeChange={setLocationMode} />

          <div className="mt-4">
            {locationMode === "region" ? (
              <>
                <RegionCascadingSelect
                  onSelect={setRegionFilter}
                  value={regionFilter}
                />
                <button
                  onClick={handleRegionSearch}
                  disabled={!regionFilter.province || loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? "Mencari..." : "Cari SPPG"}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                {/* GPS Coordinates Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {gpsCoords ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>
                        Lokasi: {gpsCoords.lat.toFixed(4)},{" "}
                        {gpsCoords.lng.toFixed(4)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Belum ada lokasi yang dipilih
                    </p>
                  )}
                </div>

                <button
                  onClick={handleDetectLocation}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {gpsLoading ? "Mencari lokasi..." : "Gunakan Lokasi Saya"}
                </button>

                {/* Radius Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Radius Pencarian
                  </label>
                  <div className="flex gap-2">
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          radiusKm === r
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGpsSearch}
                  disabled={!gpsCoords || loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {loading ? "Mencari..." : "Cari di Sekitar Saya"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Mencari SPPG...</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tidak ada SPPG ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Coba perbesar radius atau pilih region yang berbeda
            </p>
          </div>
        )}

        {!loading && hasSearched && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {pagination?.total} SPPG ditemukan
            </p>
            <div className="space-y-3">
              {results.map((sppg) => (
                <Link
                  key={sppg.id}
                  href={`/sppg/${sppg.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {sppg.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {sppg.address ||
                          `${sppg.village ? sppg.village + ", " : ""}${sppg.district}, ${sppg.regency}`}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {sppg.batchCount} batch
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {sppg.totalBeneficiary} penerima
                        </span>
                      </div>
                    </div>
                    {sppg.distanceKm !== undefined && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap ml-3">
                        {sppg.distanceKm} km
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-500">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Mulai Pencarian
            </h3>
            <p className="text-gray-500 text-sm">
              Pilih region atau gunakan GPS untuk menemukan SPPG terdekat
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
