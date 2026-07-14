"use client";

import { MarketSupplierItem } from "./types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface MarketCardProps {
  item: MarketSupplierItem;
  medianPrice?: number;
  onAddToDraft: (item: MarketSupplierItem) => void;
}

export function MarketCard({
  item,
  medianPrice,
  onAddToDraft,
}: MarketCardProps) {
  const priceDiff =
    medianPrice && medianPrice > 0
      ? ((item.price - medianPrice) / medianPrice) * 100
      : 0;

  const isAboveMedian = priceDiff > 5;
  const isBelowMedian = priceDiff < -5;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Header: Supplier Name + Anomaly Badge */}
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 ml-2 flex-shrink-0">
            <AlertTriangle className="w-3 h-3" />
            Anomali
          </span>
        )}
      </div>

      {/* Item Name */}
      <p className="text-sm text-gray-600 mb-3">{item.itemName}</p>

      {/* Price */}
      <div className="flex items-end justify-between mb-4 mt-auto">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Harga per {item.unit}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(item.price)}
          </p>
          {medianPrice !== undefined && medianPrice > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {isBelowMedian ? (
                <TrendingDown className="w-3 h-3 text-green-500" />
              ) : isAboveMedian ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : (
                <CheckCircle className="w-3 h-3 text-blue-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  isBelowMedian
                    ? "text-green-600"
                    : isAboveMedian
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {priceDiff > 0 ? "+" : ""}
                {priceDiff.toFixed(1)}% dari median
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onAddToDraft(item)}
        disabled={item.isAnomaly}
        className="block w-full text-center px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {item.isAnomaly ? "Harga Anomali" : "Pesan Bahan"}
      </button>
    </div>
  );
}

function TrendingDown(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
}

function TrendingUp(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
