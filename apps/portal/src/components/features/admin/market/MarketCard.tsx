"use client";

import { MarketSupplierItem } from "./types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Package,
  ShoppingCart,
  Store,
  FlaskConical,
  Box,
} from "lucide-react";

interface MarketCardProps {
  item: MarketSupplierItem;
  medianPrice?: number;
  onAddToDraft: (item: MarketSupplierItem) => void;
  onOrderClick: (item: MarketSupplierItem) => void;
  draftQuantity?: number;
  onViewDraft: () => void;
  isRefetching?: boolean;
}

function timeAgo(dateStr?: string): string | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bln lalu`;
}

function StockBadge({ stock, unit }: { stock?: number; unit?: string }) {
  if (stock == null) return null;
  const color =
    stock === 0
      ? "bg-red-50 text-red-600"
      : stock < 10
        ? "bg-amber-50 text-amber-600"
        : "bg-green-50 text-green-600";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Box className="w-3 h-3" />
      {stock === 0 ? "Stok Habis" : `Stok: ${stock} ${unit || ""}`}
    </span>
  );
}

function OpenStatusBadge({ status }: { status?: boolean }) {
  if (status === undefined || status === true) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
      🔴 Tutup
    </span>
  );
}

export function MarketCard({
  item,
  medianPrice,
  onAddToDraft,
  onOrderClick,
  draftQuantity,
  onViewDraft,
  isRefetching,
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

  const detailHref = item.itemId
    ? `/admin/market/${item.itemId}`
    : undefined;

  const cardContent = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      {item.image ? (
        <img
          src={item.image}
          alt={item.itemName || ""}
          className="w-full h-36 object-cover rounded-lg mb-3"
        />
      ) : (
        <div className="w-full h-36 bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.profileImage ? (
            <img
              src={item.profileImage}
              alt={item.supplierName}
              className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Store className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {item.supplierName}
              </h3>
              <OpenStatusBadge status={item.openStatus} />
            </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {item.isMarketSeller && item.marketName && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Store className="w-3 h-3" />
                {item.marketName}
              </span>
            )}
            {item.isSimulation && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <FlaskConical className="w-3 h-3" />
                Data Simulasi
              </span>
            )}
            {item.categoryName && (
              <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {item.categoryName}
              </span>
            )}
            {item.commodityName && (
              <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {item.commodityName}
              </span>
            )}
          </div>
          </div>
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

      <p className="text-sm font-medium text-gray-700 mb-2">{item.itemName}</p>

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

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Harga per {item.unit}</p>
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(item.price)}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.minOrderQty != null && item.minOrderQty > 0 && (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">
                  Min. beli: {item.minOrderQty} {item.unit}
                </p>
              </div>
            )}
            <StockBadge stock={item.stock} unit={item.unit} />
          </div>
          {item.priceUpdatedAt && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">
                Update: {timeAgo(item.priceUpdatedAt)}
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

      {item.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      <div className="flex flex-col gap-2 mt-auto">
        {draftQuantity != null && draftQuantity > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <p className="text-xs font-medium text-green-700 whitespace-nowrap">
              Dalam keranjang: {draftQuantity} {item.unit}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          {detailHref && (
            <Link
              href={detailHref}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Detail
            </Link>
          )}
          {draftQuantity != null && draftQuantity > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onViewDraft();
              }}
              disabled={isRefetching}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isRefetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memperbarui...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <ShoppingCart className="w-4 h-4" />
                  Lihat Keranjang
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOrderClick(item);
              }}
              disabled={item.isAnomaly || isRefetching || item.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isRefetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memperbarui...
                </span>
              ) : item.isAnomaly ? (
                "Harga Anomali"
              ) : item.stock === 0 ? (
                "Stok Habis"
              ) : (
                "Pesan Bahan"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (detailHref) {
    return (
      <Link href={detailHref} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
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
