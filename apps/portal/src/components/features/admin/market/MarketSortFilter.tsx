"use client";

import { MarketSortOption } from "./types";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface MarketSortFilterProps {
  value: MarketSortOption;
  onChange: (value: MarketSortOption) => void;
  hasDistanceData: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefresh?: boolean;
}

const SORT_OPTIONS: {
  value: MarketSortOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "default",
    label: "Urutkan",
    icon: <ArrowUpDown className="w-3.5 h-3.5" />,
  },
  {
    value: "price_desc",
    label: "Harga Tertinggi",
    icon: <ArrowDown className="w-3.5 h-3.5" />,
  },
  {
    value: "price_asc",
    label: "Harga Terendah",
    icon: <ArrowUp className="w-3.5 h-3.5" />,
  },
  {
    value: "distance_asc",
    label: "Lokasi Terdekat",
    icon: <MapPin className="w-3.5 h-3.5" />,
  },
];

export function MarketSortFilter({
  value,
  onChange,
  hasDistanceData,
  onRefresh,
  isRefreshing,
  showRefresh,
}: MarketSortFilterProps) {
  const availableOptions = SORT_OPTIONS.filter(
    (opt) => opt.value !== "distance_asc" || hasDistanceData,
  );

  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Urutkan:</span>
        <div className="flex flex-wrap gap-1.5">
          {availableOptions.map((option) => {
            const isActive = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700 border border-primary-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {showRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh data</span>
        </button>
      )}
    </div>
  );
}
