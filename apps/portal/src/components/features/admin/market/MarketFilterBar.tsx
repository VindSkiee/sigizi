"use client";

import { useState, useMemo } from "react";
import { MarketFilter, DEFAULT_FILTER } from "./types";
import { REGIONS } from "./regions";
import { MOCK_ITEM_NAMES } from "./mockData";

interface MarketFilterBarProps {
  onSearch: (filter: MarketFilter) => void;
  isLoading: boolean;
}

export function MarketFilterBar({ onSearch, isLoading }: MarketFilterBarProps) {
  const [filter, setFilter] = useState<MarketFilter>(DEFAULT_FILTER);

  const selectedRegion = useMemo(
    () => REGIONS.find((r) => r.name === filter.province),
    [filter.province]
  );

  const selectedRegency = useMemo(
    () => selectedRegion?.regencies.find((r) => r.name === filter.regency),
    [selectedRegion, filter.regency]
  );

  const districts = selectedRegency?.districts ?? [];
  const regencies = selectedRegion?.regencies ?? [];

  const handleChange = (field: keyof MarketFilter, value: string | number) => {
    setFilter((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "province") {
        next.regency = "";
        next.district = "";
      }
      if (field === "regency") {
        next.district = "";
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filter);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Provinsi */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Provinsi
          </label>
          <select
            value={filter.province}
            onChange={(e) => handleChange("province", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Provinsi</option>
            {REGIONS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kabupaten */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Kabupaten
          </label>
          <select
            value={filter.regency}
            onChange={(e) => handleChange("regency", e.target.value)}
            disabled={!filter.province}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Semua Kabupaten</option>
            {regencies.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kecamatan */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Kecamatan
          </label>
          <select
            value={filter.district}
            onChange={(e) => handleChange("district", e.target.value)}
            disabled={!filter.regency}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Semua Kecamatan</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Radius */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Radius: {filter.radius} km
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={filter.radius}
            onChange={(e) => handleChange("radius", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 mt-2"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 km</span>
            <span>100 km</span>
          </div>
        </div>

        {/* Bahan Baku */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Cari Bahan Baku
          </label>
          <input
            type="text"
            value={filter.item}
            onChange={(e) => handleChange("item", e.target.value)}
            placeholder="Contoh: Beras, Ayam..."
            list="item-suggestions"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <datalist id="item-suggestions">
            {MOCK_ITEM_NAMES.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari Bahan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
