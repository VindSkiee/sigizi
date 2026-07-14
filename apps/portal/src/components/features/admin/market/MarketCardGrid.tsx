"use client";

import { MarketSupplierItem } from "./types";
import { MarketCard } from "./MarketCard";

interface MarketCardGridProps {
  items: MarketSupplierItem[];
  medianPrice?: number;
  onAddToDraft: (item: MarketSupplierItem) => void;
}

export function MarketCardGrid({
  items,
  medianPrice,
  onAddToDraft,
}: MarketCardGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-gray-500 text-sm">
          Tidak ada bahan baku ditemukan
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Coba ubah filter pencarian atau kata kunci bahan baku
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <MarketCard
          key={item.id}
          item={item}
          medianPrice={medianPrice}
          onAddToDraft={onAddToDraft}
        />
      ))}
    </div>
  );
}
