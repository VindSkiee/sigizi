"use client";

import { MarketSupplierItem } from "./types";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  MapPin,
  Navigation,
  Package,
  ShoppingCart
} from "lucide-react";

interface MarketCardProps {
  item: MarketSupplierItem;
  medianPrice?: number;
  onAddToDraft: (item: MarketSupplierItem) => void;
  onOrderClick: (item: MarketSupplierItem) => void;
  draftQuantity?: number;
  onViewDraft: () => void;
}

export function MarketCard({
  item,
  medianPrice,
  onAddToDraft,
  onOrderClick,
  draftQuantity,
  onViewDraft,
}: MarketCardProps) {
  const priceDiff =
    medianPrice && medianPrice > 0
      ? ((item.price - medianPrice) / medianPrice) * 100
      : 0;

  const isAboveMedian = priceDiff > 5;
  const isBelowMedian = priceDiff < -5;

  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const locationParts = [item.district, item.regency].filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Header: Supplier Name + Anomaly Badge */}
      <div className="flex items-start justify-between mb-2">
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
      <p className="text-sm font-medium text-gray-700 mb-2">{item.itemName}</p>

      {/* Address + Distance */}
      <div className="space-y-1.5 mb-3">
        {(item.address || locationParts.length > 0) && (
          <a
            href={
              item.latitude != null && item.longitude != null
                ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    (item.address ? item.address + ", " : "") +
                      locationParts.join(", "),
                  )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-1.5 group"
          >
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-primary-500 transition-colors" />
            <p className="text-xs text-gray-500 leading-relaxed group-hover:text-primary-600 transition-colors underline decoration-dotted underline-offset-2 decoration-gray-300 group-hover:decoration-primary-400">
              {item.address}
              {item.address && locationParts.length > 0 && (
                <span className="text-gray-400 group-hover:text-primary-500">
                  , {locationParts.join(", ")}
                </span>
              )}
              {!item.address && locationParts.length > 0 && (
                <span>{locationParts.join(", ")}</span>
              )}
            </p>
          </a>
        )}
        {item.distance != null && (
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <p className="text-xs font-medium text-primary-600">
              {formatDistance(item.distance)} dari lokasi Anda
            </p>
          </div>
        )}
      </div>

      {/* Price + Min Order */}
      <div className="flex items-end justify-between mb-3 mt-auto">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Harga per {item.unit}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(item.price)}
          </p>
          {item.minOrderQty != null && item.minOrderQty > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Package className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">
                Min. beli: {item.minOrderQty} {item.unit}
              </p>
            </div>
          )}
        </div>
        {medianPrice !== undefined && medianPrice > 0 && (
          <div className="flex items-center gap-1">
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

      {/* Description */}
      {item.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Action Button */}
      {draftQuantity != null && draftQuantity > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-medium text-green-700">
              Dalam keranjang: {draftQuantity} {item.unit}
            </p>
          </div>
          <button
            onClick={onViewDraft}
            className="block w-full text-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              Lihat Keranjang
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => onOrderClick(item)}
          disabled={item.isAnomaly}
          className="block w-full text-center px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {item.isAnomaly ? "Harga Anomali" : "Pesan Bahan"}
        </button>
      )}
    </div>
  );
}

function TrendingDown(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
      />
    </svg>
  );
}

function TrendingUp(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}
