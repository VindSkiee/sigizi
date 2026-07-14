"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MarketFilter,
  MarketSupplierItem,
  MarketPriceStatistics,
} from "@/components/features/admin/market/types";
import { MarketFilterBar } from "@/components/features/admin/market/MarketFilterBar";
import { MarketStatsBar } from "@/components/features/admin/market/MarketStatsBar";
import { MarketCardGrid } from "@/components/features/admin/market/MarketCardGrid";
import { DraftOrderModal } from "@/components/features/admin/market/DraftOrderModal";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/ui/Toast";
import { DraftItem } from "@/components/features/admin/create-order/types";
import {
  getDraftItems,
  addDraftItem,
  updateDraftQuantity,
  removeDraftItem,
} from "@/lib/draft";
import { getMarketPrices } from "@/lib/api";

const ITEMS_PER_PAGE = 9;

export default function MarketPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<MarketSupplierItem[]>([]);
  const [rawStats, setRawStats] = useState<MarketPriceStatistics | null>(null);
  const [cleanStats, setCleanStats] = useState<MarketPriceStatistics | null>(null);
  const [searchedItem, setSearchedItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setDraftItems(getDraftItems());
  }, []);

  const handleSearch = useCallback(
    async (filter: MarketFilter) => {
      if (!token) return;
      setIsLoading(true);
      setHasSearched(true);
      setError(null);
      setCurrentPage(1);

      try {
        const response = await getMarketPrices(token, {
          item: filter.item,
          regency: filter.locationMode === "region" ? filter.regency : undefined,
          latitude:
            filter.locationMode === "gps" && filter.latitude
              ? parseFloat(filter.latitude)
              : undefined,
          longitude:
            filter.locationMode === "gps" && filter.longitude
              ? parseFloat(filter.longitude)
              : undefined,
          radiusKm:
            filter.locationMode === "gps" && filter.radiusKm
              ? parseFloat(filter.radiusKm)
              : undefined,
        });

        if (response.success) {
          const data = response.data as any;
          setItems(
            (data.suppliers || []).map((s: any) => ({
              id: s.id,
              supplierId: s.id,
              supplierName: s.name ?? "-",
              itemName: s.itemName ?? undefined,
              unit: s.unit ?? undefined,
              price: s.price,
              isAnomaly: s.isAnomaly,
              distance: s.distanceKm,
            }))
          );
          setRawStats(data.statistics?.raw || null);
          setCleanStats(data.statistics?.clean || null);
          setSearchedItem(filter.item);
        } else {
          setError("Gagal memuat data harga pasar");
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch market prices:", err);
        setError("Gagal memuat data harga pasar");
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddToDraft = useCallback((item: MarketSupplierItem) => {
    const newItem = {
      supplierId: item.supplierId || "",
      supplierName: item.supplierName,
      itemId: item.id,
      itemName: item.itemName ?? "-",
      unit: item.unit ?? "-",
      unitPrice: item.price,
      quantity: 1,
    };
    const updated = addDraftItem(newItem);
    setDraftItems(updated);
    setShowToast(true);
  }, []);

  const handleUpdateQuantity = useCallback((draftId: string, qty: number) => {
    const updated = updateDraftQuantity(draftId, qty);
    setDraftItems(updated);
  }, []);

  const handleRemove = useCallback((draftId: string) => {
    const updated = removeDraftItem(draftId);
    setDraftItems(updated);
  }, []);

  const handleCloseToast = useCallback(() => setShowToast(false), []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analitik Pasar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau harga bahan baku pasar dari supplier di seluruh region.
        </p>
      </div>

      <MarketFilterBar onSearch={handleSearch} isLoading={isLoading} />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && hasSearched && !error && rawStats && cleanStats && (
        <>
          <MarketStatsBar
            rawStats={rawStats}
            cleanStats={cleanStats}
            item={searchedItem}
          />
          <MarketCardGrid
            items={paginatedItems}
            medianPrice={cleanStats.median}
            onAddToDraft={handleAddToDraft}
          />
          {items.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                Menampilkan {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, items.length)} dari{" "}
                {items.length} supplier
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <p className="text-gray-500 text-sm mb-1">
            Pilih bahan baku dan region, lalu klik &quot;Lihat Harga Pasar&quot;
          </p>
          <p className="text-gray-400 text-xs">
            Harga akan ditampilkan beserta statistik data mentah dan data bersih
          </p>
        </div>
      )}

      <button
        onClick={() => setShowDraftModal(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all hover:scale-105"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        Lihat Draft
        {draftItems.length > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-primary-600 rounded-full">
            {draftItems.length}
          </span>
        )}
      </button>

      <DraftOrderModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        items={draftItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />

      <Toast
        message="Berhasil ditambahkan ke draft"
        isVisible={showToast}
        onClose={handleCloseToast}
      />
    </div>
  );
}
