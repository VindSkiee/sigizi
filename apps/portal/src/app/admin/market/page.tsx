"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MarketFilter,
  MarketSupplierItem,
  MarketStats,
} from "@/components/features/admin/market/types";
import { MOCK_MARKET_ITEMS } from "@/components/features/admin/market/mockData";
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

const ITEMS_PER_PAGE = 9;

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MarketPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketSupplierItem[]>(MOCK_MARKET_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setDraftItems(getDraftItems());
  }, []);

  const adminLocation = useMemo(() => {
    if (user?.sppg?.latitude != null && user?.sppg?.longitude != null) {
      return {
        latitude: user.sppg.latitude,
        longitude: user.sppg.longitude,
        name: user.sppg.name,
      };
    }
    return { latitude: -6.5569, longitude: 107.4448, name: "Lokasi Default" };
  }, [user]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.latitude && item.longitude) {
        const dist = calculateDistanceKm(
          adminLocation.latitude,
          adminLocation.longitude,
          item.latitude,
          item.longitude
        );
        if (dist > 100) return false;
      }
      return true;
    });
  }, [items, adminLocation]);

  const stats: MarketStats = useMemo(() => {
    if (filteredItems.length === 0) {
      return { total: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 };
    }
    const prices = filteredItems.map((i) => i.price);
    return {
      total: filteredItems.length,
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (filter: MarketFilter) => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1);

    setTimeout(() => {
      let result = [...MOCK_MARKET_ITEMS];

      if (filter.item) {
        const search = filter.item.toLowerCase();
        result = result.filter((i) => i.itemName.toLowerCase().includes(search));
      }

      result = result.filter((item) => {
        if (!item.latitude || !item.longitude) return true;
        const dist = calculateDistanceKm(
          adminLocation.latitude,
          adminLocation.longitude,
          item.latitude,
          item.longitude
        );
        return dist <= filter.radius;
      });

      result = result.map((item) => ({
        ...item,
        distance:
          item.latitude && item.longitude
            ? calculateDistanceKm(
                adminLocation.latitude,
                adminLocation.longitude,
                item.latitude,
                item.longitude
              )
            : undefined,
      }));

      result.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

      setItems(result);
      setIsLoading(false);
    }, 500);
  };

  const handleAddToDraft = useCallback((item: MarketSupplierItem) => {
    const newItem = {
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      itemId: item.id,
      itemName: item.itemName,
      unit: item.unit,
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
          Temukan bahan baku dari supplier terdekat dengan harga terbaik.
        </p>
      </div>

      <MarketFilterBar
        onSearch={handleSearch}
        isLoading={isLoading}
        adminLocation={adminLocation}
      />

      {hasSearched && !isLoading && <MarketStatsBar stats={stats} />}

      {hasSearched ? (
        <>
          <MarketCardGrid items={paginatedItems} onAddToDraft={handleAddToDraft} />
          {filteredItems.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} dari {filteredItems.length} supplier
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
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
            Pilih filter dan klik &quot;Cari Bahan&quot; untuk menemukan supplier
          </p>
          <p className="text-gray-400 text-xs">
            Hasil akan menampilkan supplier dalam radius yang dipilih
          </p>
        </div>
      )}

      <button
        onClick={() => setShowDraftModal(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
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
