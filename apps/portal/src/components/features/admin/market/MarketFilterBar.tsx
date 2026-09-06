"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Navigation, AlertTriangle, Store, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MarketFilter,
  LocationMode,
  DEFAULT_FILTER,
} from "./types";
import {
  getSupplierRegions,
  getDistinctMarkets,
  getItemCategories,
  getItemCommodities,
} from "@/lib/api";
import { denormalizeRegion } from "@sigizi/shared";

interface MarketFilterBarProps {
  onSearch: (filter: MarketFilter) => void;
  isLoading: boolean;
  initialFilter?: MarketFilter | null;
}

const RADIUS_PRESETS = [5, 10, 25, 50];

interface RegionData {
  province: string;
  regencies: string[];
}

interface MarketData {
  name: string;
  supplierCount: number;
  itemCount: number;
}

interface Category {
  id: string;
  name: string;
}

interface Commodity {
  id: string;
  name: string;
}

export function MarketFilterBar({
  onSearch,
  isLoading,
  initialFilter,
}: MarketFilterBarProps) {
  const { user, token, hasLocation } = useAuth();
  const [filter, setFilter] = useState<MarketFilter>(
    initialFilter ?? DEFAULT_FILTER,
  );

  const [regions, setRegions] = useState<RegionData[]>([]);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [commodityName, setCommodityName] = useState("");

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    if (!token) return;
    setLoadingRegions(true);
    getSupplierRegions(token)
      .then((res) => {
        if (res.success) {
          const data = res.data as any;
          // Backend P2 returns { data: [...provinces], meta: {...} }
          const regions = data?.data || data?.provinces || data || [];
          setRegions(Array.isArray(regions) ? regions : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRegions(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getItemCategories(token)
      .then((res) => {
        if (res.success) setCategories((res.data as any) || []);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || !categoryId) {
      setCommodities([]);
      return;
    }
    getItemCommodities(token, categoryId)
      .then((res) => {
        if (res.success) setCommodities((res.data as any) || []);
      })
      .catch(() => {});
  }, [token, categoryId]);

  useEffect(() => {
    if (!token || !filter.province || !filter.regency) {
      setMarkets([]);
      return;
    }
    setLoadingMarkets(true);
    getDistinctMarkets(
      token,
      filter.province,
      filter.regency,
      filter.item || undefined,
    )
      .then((res) => {
        if (res.success) {
          const data = res.data as any;
          // Backend P2 returns { data: [...markets], meta: {...} }
          const marketsData = data?.data || data?.markets || data || [];
          setMarkets(Array.isArray(marketsData) ? marketsData : []);
        }
      })
      .catch(() => setMarkets([]))
      .finally(() => setLoadingMarkets(false));
  }, [token, filter.province, filter.regency, filter.item]);

  const provinces = regions.map((r) => r.province);

  const regencies =
    regions.find((r) => r.province === filter.province)?.regencies || [];

  const sppgLat = user?.sppg?.latitude;
  const sppgLng = user?.sppg?.longitude;

  const handleChange = useCallback(
    (field: keyof MarketFilter, value: string) => {
      setFilter((prev) => {
        const updated = { ...prev, [field]: value };
        if (field === "province") {
          updated.regency = "";
          updated.district = "";
          updated.marketName = "";
        }
        if (field === "regency") {
          updated.district = "";
          updated.marketName = "";
        }
        return updated;
      });
    },
    [],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategoryId(value);
      setCommodityId("");
      setCommodityName("");
      handleChange("item", "");
      handleChange("categoryId", value);
      handleChange("commodityId", "");
    },
    [handleChange],
  );

  const handleCommodityChange = useCallback(
    (value: string) => {
      const commodity = commodities.find((c) => c.id === value);
      const name = commodity?.name || "";
      setCommodityId(value);
      setCommodityName(name);
      handleChange("item", name);
      handleChange("commodityId", value);
    },
    [commodities, handleChange],
  );

  const handleRadiusChange = useCallback(
    (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        handleChange("radiusKm", value);
        return;
      }
      if (num < 1) handleChange("radiusKm", "1");
      else if (num > 500) handleChange("radiusKm", "500");
      else handleChange("radiusKm", value);
    },
    [handleChange],
  );

  const handleModeChange = useCallback((mode: LocationMode) => {
    setFilter((prev) => ({
      ...prev,
      locationMode: mode,
      province: "",
      regency: "",
      district: "",
      marketName: "",
      radiusKm: "25",
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!filter.item) return;
      if (filter.locationMode === "region" && !filter.regency) return;
      if (filter.locationMode === "gps" && !hasLocation) return;
      onSearch(filter);
    },
    [filter, hasLocation, onSearch],
  );

  const isRegionValid =
    filter.locationMode === "region" && filter.regency.trim() !== "";
  const isGpsValid =
    filter.locationMode === "gps" &&
    hasLocation &&
    filter.radiusKm.trim() !== "";
  const isValid = filter.item.trim() !== "" && (isRegionValid || isGpsValid);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Kategori */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Kategori Bahan
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-9 pr-4 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Semua kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Komoditas */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Komoditas <span className="text-red-500">*</span>
          </label>
          <select
            value={
              commodityName
                ? commodities.find((c) => c.name === commodityName)?.id || ""
                : ""
            }
            onChange={(e) => handleCommodityChange(e.target.value)}
            disabled={!categoryId}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">
              {categoryId ? "Pilih komoditas" : "Pilih kategori dulu"}
            </option>
            {commodities.map((com) => (
              <option key={com.id} value={com.id}>
                {com.name}
              </option>
            ))}
          </select>
          {categoryId && commodities.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Tidak ada komoditas</p>
          )}
        </div>

        {/* Location Mode Toggle */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => handleModeChange("region")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter.locationMode === "region"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Region
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("gps")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter.locationMode === "gps"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Radius
            </button>
          </div>

          {filter.locationMode === "region" ? (
            <div className="space-y-3">
              {/* Province */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <select
                  value={filter.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  disabled={loadingRegions}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {loadingRegions ? "Memuat provinsi..." : "Pilih provinsi"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {denormalizeRegion(p)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regency */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Kabupaten / Kota <span className="text-red-500">*</span>
                </label>
                <select
                  value={filter.regency}
                  onChange={(e) => handleChange("regency", e.target.value)}
                  disabled={!filter.province}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {filter.province
                      ? "Pilih kabupaten/kota"
                      : "Pilih provinsi terlebih dahulu"}
                  </option>
                  {regencies.map((r) => (
                    <option key={r} value={r}>
                      {denormalizeRegion(r)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market (Pasar) */}
              {markets.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Pasar{" "}
                    <span className="text-gray-400 font-normal">
                      (opsional)
                    </span>
                  </label>
                  <select
                    value={filter.marketName}
                    onChange={(e) => handleChange("marketName", e.target.value)}
                    disabled={loadingMarkets}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Semua pasar</option>
                    {markets.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.supplierCount} supplier, {m.itemCount}{" "}
                        items)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Filter harga dari supplier di pasar tertentu
                  </p>
                </div>
              )}

              {/* District (Optional) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Kecamatan{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <select
                  value={filter.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  disabled={!filter.regency}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Semua kecamatan</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                {filter.marketName ? (
                  <>
                    <Store className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">
                      Harga dari supplier di {filter.marketName}
                      {filter.regency
                        ? `, ${denormalizeRegion(filter.regency)}`
                        : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">
                      Harga dari supplier di{" "}
                      {filter.regency
                        ? denormalizeRegion(filter.regency)
                        : "region ini"}
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!hasLocation ? (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">
                      Lokasi belum diatur
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Silakan atur koordinat GPS SPPG Anda di halaman profil
                      terlebih dahulu.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* SPPG Location Info */}
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <Navigation className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="text-xs">
                      <span className="text-gray-500">Lokasi SPPG:</span>{" "}
                      <span className="font-medium text-gray-700">
                        {user?.sppg?.name || "-"}
                      </span>
                      <span className="text-gray-400 ml-1.5">
                        ({sppgLat?.toFixed(4)}, {sppgLng?.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  {/* Radius Slider + Manual */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Radius pencarian
                    </label>
                    <div className="flex items-center gap-3">
                      {/* Slider */}
                      <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={filter.radiusKm || "25"}
                        onChange={(e) => handleRadiusChange(e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      {/* Manual Input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={filter.radiusKm}
                          onChange={(e) => handleRadiusChange(e.target.value)}
                          className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="text-xs text-gray-500">km</span>
                      </div>
                    </div>
                    {/* Preset Buttons */}
                    <div className="flex gap-1.5 mt-2">
                      {RADIUS_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            handleChange("radiusKm", String(preset))
                          }
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            filter.radiusKm === String(preset)
                              ? "bg-primary-100 text-primary-700 border border-primary-300"
                              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {preset} km
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Cari supplier dalam radius tertentu dari lokasi SPPG
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Mencari...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Lihat Harga Pasar
            </>
          )}
        </button>
      </div>
    </form>
  );
}
