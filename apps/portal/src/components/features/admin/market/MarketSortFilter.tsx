"use client";

import { MarketSortOption } from "./types";
import { ArrowUpDown, ArrowDown, ArrowUp, MapPin } from "lucide-react";

interface MarketSortFilterProps {
  value: MarketSortOption;
  onChange: (value: MarketSortOption) => void;
  hasDistanceData: boolean;
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
}: MarketSortFilterProps) {
  const availableOptions = SORT_OPTIONS.filter(
    (opt) => opt.value !== "distance_asc" || hasDistanceData,
  );

  return (
    <div className="flex items-center gap-2 mb-4">
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
  );
}
