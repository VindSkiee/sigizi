"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { MarketFilter, POPULAR_ITEMS, DEFAULT_FILTER } from "./types";
import { REGIONS } from "./regions";

interface MarketFilterBarProps {
  onSearch: (filter: MarketFilter) => void;
  isLoading: boolean;
}

export function MarketFilterBar({ onSearch, isLoading }: MarketFilterBarProps) {
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER);

  const regencies = REGIONS.flatMap((r) => r.regencies);

  const handleChange = (field: keyof MarketFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filter.item || !filter.regency) return;
    onSearch(filter);
  };

  const isValid = filter.item.trim() !== "" && filter.regency.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Region <span className="text-red-500">*</span>
          </label>
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

        {/* Search Button */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
      </div>
    </form>
  );
}
