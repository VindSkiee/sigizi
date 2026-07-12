"use client";

import { MarketSupplierItem } from "./types";
import { formatCurrency } from "@/lib/utils";

interface MarketCardProps {
  item: MarketSupplierItem;
  onAddToDraft: (item: MarketSupplierItem) => void;
}

export function MarketCard({ item, onAddToDraft }: MarketCardProps) {
  const distanceText =
    item.distance !== undefined
      ? item.distance < 1
        ? `${(item.distance * 1000).toFixed(0)} m`
        : `${item.distance.toFixed(1)} km`
      : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Header: Supplier Name + MoU Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.supplierName}
          </h3>
          {item.mou && (
            <span className="inline-flex items-center gap-1 text-xs text-primary-600 mt-0.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              MoU Aktif
            </span>
          )}
        </div>
        {item.isAnomaly && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ml-2 flex-shrink-0">
            Harga Anomali
          </span>
        )}
      </div>

      {/* Item Name */}
      <p className="text-sm text-gray-600 mb-3">
        {item.itemName}
      </p>

      {/* Price + Distance */}
      <div className="flex items-end justify-between mb-4 mt-auto">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Harga per {item.unit}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(item.price)}
          </p>
        </div>
        {distanceText && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Jarak</p>
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{distanceText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAddToDraft(item)}
        className="block w-full text-center px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
      >
        Pesan Bahan
      </button>
    </div>
  );
}
