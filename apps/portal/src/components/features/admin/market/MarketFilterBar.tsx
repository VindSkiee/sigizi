"use client";

import { useState } from "react";
import { Search, MapPin, Navigation } from "lucide-react";
import {
  MarketFilter,
  LocationMode,
  POPULAR_ITEMS,
  DEFAULT_FILTER,
} from "./types";
import { REGIONS } from "./regions";

interface MarketFilterBarProps {
  onSearch: (filter: MarketFilter) => void;
  isLoading: boolean;
}

export function MarketFilterBar({ onSearch, isLoading }: MarketFilterBarProps) {
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER);
  const [geoLoading, setGeoLoading] = useState(false);

  const regencies = REGIONS.flatMap((r) => r.regencies);

  const handleChange = (field: keyof MarketFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const handleModeChange = (mode: LocationMode) => {
    setFilter((prev) => ({
      ...prev,
      locationMode: mode,
      regency: "",
      latitude: "",
      longitude: "",
      radiusKm: "",
    }));
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilter((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filter.item) return;
    if (filter.locationMode === "region" && !filter.regency) return;
    if (
      filter.locationMode === "gps" &&
      (!filter.latitude || !filter.longitude)
    )
      return;
    onSearch(filter);
  };

  const isRegionValid = filter.locationMode === "region" && filter.regency.trim() !== "";
  const isGpsValid =
    filter.locationMode === "gps" &&
    filter.latitude.trim() !== "" &&
    filter.longitude.trim() !== "";
  const isValid = filter.item.trim() !== "" && (isRegionValid || isGpsValid);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Bahan Baku */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Bahan Baku <span className="text-red-500">*</span>
          </label>
          <select
            value={filter.item}
            onChange={(e) => handleChange("item", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Pilih bahan baku</option>
            {POPULAR_ITEMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Contoh: Beras, Ayam, Telur, dll.
          </p>
        </div>

        {/* Location Mode Toggle */}
        <div className="md:col-span-2">
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
              GPS Lokasi
            </button>
          </div>

          {filter.locationMode === "region" ? (
            <div>
              <select
                value={filter.regency}
                onChange={(e) => handleChange("regency", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Pilih region</option>
                {regencies.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-400">
                  Harga dari supplier di region ini
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="-6.5398"
                    value={filter.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="107.4471"
                    value={filter.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    max="500"
                    placeholder="25"
                    value={filter.radiusKm}
                    onChange={(e) => handleChange("radiusKm", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Default: 25 km. Maks: 500 km
                  </p>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geoLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {geoLoading ? "Mencari..." : "Ambil Lokasi Saya"}
                  </button>
                </div>
              </div>
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
