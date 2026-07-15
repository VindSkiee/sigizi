"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { OrderQuantityModal } from "@/components/features/admin/market/OrderQuantityModal";
import { RadiusWarningModal } from "@/components/features/admin/market/RadiusWarningModal";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/ui/Toast";
import { DraftItem } from "@/components/features/admin/create-order/types";
import {
  getDraftItems,
  addDraftItem,
  updateDraftQuantity,
  removeDraftItem,
} from "@/lib/draft";
import { getMarketState, saveMarketState } from "@/lib/market-persist";
import { getMarketPrices } from "@/lib/api";

const ITEMS_PER_PAGE = 9;

export default function MarketPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [items, setItems] = useState<MarketSupplierItem[]>([]);
  const [rawStats, setRawStats] = useState<MarketPriceStatistics | null>(null);
  const [cleanStats, setCleanStats] = useState<MarketPriceStatistics | null>(
    null,
  );
  const [searchedItem, setSearchedItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [toastState, setToastState] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [orderModalItem, setOrderModalItem] =
    useState<MarketSupplierItem | null>(null);

  const [radiusWarning, setRadiusWarning] = useState<{
    requested: number;
    effective: number;
    supplierCount: number;
  } | null>(null);
  const [requestedRadius, setRequestedRadius] = useState<number | null>(null);
  const [showExpanded, setShowExpanded] = useState(true);
  const [lastFilter, setLastFilter] = useState<MarketFilter | null>(null);

  useEffect(() => {
    setDraftItems(getDraftItems());
    const persisted = getMarketState();
    if (!persisted) return;

    setLastFilter(persisted.filter);
    setItems(persisted.items);
    setRawStats(persisted.rawStats);
    setCleanStats(persisted.cleanStats);
    setSearchedItem(persisted.searchedItem);
    setHasSearched(Boolean(persisted.searchedItem));
    setCurrentPage(persisted.currentPage);
    setShowExpanded(persisted.showExpanded);
    setRequestedRadius(persisted.requestedRadius);
    setError(persisted.error);
  }, []);

  const persistMarketState = useCallback(
    (overrides: Partial<Parameters<typeof saveMarketState>[0]> = {}) => {
      if (!lastFilter && !overrides.filter) return;
      saveMarketState({
        filter: overrides.filter ?? lastFilter!,
        items: overrides.items ?? items,
        rawStats: overrides.rawStats ?? rawStats,
        cleanStats: overrides.cleanStats ?? cleanStats,
        searchedItem: overrides.searchedItem ?? searchedItem,
        currentPage: overrides.currentPage ?? currentPage,
        showExpanded: overrides.showExpanded ?? showExpanded,
        requestedRadius: overrides.requestedRadius ?? requestedRadius,
        error: overrides.error ?? error,
      });
    },
    [
      cleanStats,
      currentPage,
      error,
      items,
      lastFilter,
      rawStats,
      requestedRadius,
      searchedItem,
      showExpanded,
    ],
  );

  const handleSearch = useCallback(
    async (filter: MarketFilter) => {
      if (!token) return;
      setIsLoading(true);
      setHasSearched(true);
      setError(null);
      setCurrentPage(1);
      setLastFilter(filter);

      try {
        const response = await getMarketPrices(token, {
          item: filter.item,
          province:
            filter.locationMode === "region" && filter.province
              ? filter.province
              : undefined,
          regency:
            filter.locationMode === "region" && filter.regency
              ? filter.regency
              : undefined,
          district:
            filter.locationMode === "region" && filter.district
              ? filter.district
              : undefined,
          latitude:
            filter.locationMode === "gps"
              ? (user?.sppg?.latitude ?? undefined)
              : undefined,
          longitude:
            filter.locationMode === "gps"
              ? (user?.sppg?.longitude ?? undefined)
              : undefined,
          radiusKm:
            filter.locationMode === "gps" && filter.radiusKm
              ? parseFloat(filter.radiusKm)
              : undefined,
        });

        if (response.success) {
          const data = response.data as any;
          const mapped = (data.suppliers || []).map((s: any) => ({
            id: s.id,
            itemId: s.itemId,
            supplierId: s.id,
            supplierName: s.name ?? "-",
            itemName: s.itemName ?? undefined,
            unit: s.unit ?? undefined,
            price: s.price,
            isAnomaly: s.isAnomaly,
            distance: s.distanceKm,
            description: s.description ?? undefined,
            minOrderQty: s.minOrderQty ?? undefined,
            orderStep: s.orderStep ?? undefined,
            address: s.address ?? undefined,
            province: s.province ?? undefined,
            regency: s.regency ?? undefined,
            district: s.district ?? undefined,
            latitude: s.latitude ?? undefined,
            longitude: s.longitude ?? undefined,
          }));

          setItems(mapped);
          setRawStats(data.statistics?.raw || null);
          setCleanStats(data.statistics?.clean || null);
          setSearchedItem(filter.item);

          let nextShowExpanded = showExpanded;
          let nextRequestedRadius: number | null = requestedRadius;

          if (filter.locationMode === "gps" && filter.radiusKm) {
            const requested = parseFloat(filter.radiusKm);
            const effective = data.effectiveRadiusKm;
            if (effective && effective > requested) {
              setRadiusWarning({
                requested,
                effective,
                supplierCount: data.sampleCount,
              });
              setRequestedRadius(requested);
              setShowExpanded(true);
              nextRequestedRadius = requested;
              nextShowExpanded = true;
            } else {
              setRadiusWarning(null);
              setRequestedRadius(null);
              nextRequestedRadius = null;
            }
          } else {
            setRadiusWarning(null);
            setRequestedRadius(null);
            nextRequestedRadius = null;
          }

          saveMarketState({
            filter,
            items: mapped,
            rawStats: data.statistics?.raw || null,
            cleanStats: data.statistics?.clean || null,
            searchedItem: filter.item,
            currentPage: 1,
            showExpanded: nextShowExpanded,
            requestedRadius: nextRequestedRadius,
            error: null,
          });
        } else {
          setError("Gagal memuat data harga pasar");
          setItems([]);
          saveMarketState({
            filter,
            items: [],
            rawStats: null,
            cleanStats: null,
            searchedItem: filter.item,
            currentPage: 1,
            showExpanded,
            requestedRadius,
            error: "Gagal memuat data harga pasar",
          });
        }
      } catch (err) {
        console.error("Failed to fetch market prices:", err);
        setError("Gagal memuat data harga pasar");
        setItems([]);
        saveMarketState({
          filter,
          items: [],
          rawStats: null,
          cleanStats: null,
          searchedItem: filter.item,
          currentPage: 1,
          showExpanded,
          requestedRadius,
          error: "Gagal memuat data harga pasar",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [requestedRadius, showExpanded, token, user],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      persistMarketState({ currentPage: page });
    },
    [persistMarketState],
  );

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const filteredItems = useMemo(() => {
    if (showExpanded || !requestedRadius) {
      return items;
    }
    return items.filter((item) => (item.distance ?? 0) <= requestedRadius);
  }, [items, requestedRadius, showExpanded]);

  const paginatedFilteredItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const filteredTotalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const draftItemMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of draftItems) {
      map.set(item.itemId, (map.get(item.itemId) ?? 0) + item.quantity);
    }
    return map;
  }, [draftItems]);

  const handleAddToDraft = useCallback((item: MarketSupplierItem) => {
    const newItem = {
      supplierId: item.supplierId || "",
      supplierName: item.supplierName,
      itemId: item.itemId,
      itemName: item.itemName ?? "-",
      unit: item.unit ?? "-",
      unitPrice: item.price,
      quantity: 1,
      minOrderQty: item.minOrderQty,
      orderStep: item.orderStep,
    };
    const updated = addDraftItem(newItem);
    setDraftItems(updated);
    setToastState({ message: "Berhasil ditambahkan ke draft" });
  }, []);

  const handleUpdateQuantity = useCallback((draftId: string, qty: number) => {
    const updated = updateDraftQuantity(draftId, qty);
    setDraftItems(updated);
  }, []);

  const handleRemove = useCallback((draftId: string) => {
    const updated = removeDraftItem(draftId);
    setDraftItems(updated);
  }, []);

  const handleCloseToast = useCallback(() => setToastState(null), []);

  const handleViewDraft = useCallback(() => {
    setShowDraftModal(true);
  }, []);

  const handleNavigateOrders = useCallback(() => {
    router.push("/admin/suppliers");
  }, [router]);

  const handleOrderSuccess = useCallback(() => {
    setDraftItems([]);
    setToastState({
      message: "Pesanan berhasil diproses!",
      action: { label: "Lihat Pesanan", onClick: handleNavigateOrders },
    });
  }, [handleNavigateOrders]);

  const handleOrderClick = useCallback((item: MarketSupplierItem) => {
    setOrderModalItem(item);
  }, []);

  const handleOrderConfirm = useCallback(
    (quantity: number) => {
      if (!orderModalItem) return;
      const newItem = {
        supplierId: orderModalItem.supplierId || "",
        supplierName: orderModalItem.supplierName,
        itemId: orderModalItem.itemId,
        itemName: orderModalItem.itemName ?? "-",
        unit: orderModalItem.unit ?? "-",
        unitPrice: orderModalItem.price,
        quantity,
        minOrderQty: orderModalItem.minOrderQty,
        orderStep: orderModalItem.orderStep,
      };
      const updated = addDraftItem(newItem);
      setDraftItems(updated);
      setOrderModalItem(null);
      setToastState({ message: "Berhasil ditambahkan ke draft" });
    },
    [orderModalItem],
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analitik Pasar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau harga bahan baku pasar dari supplier di seluruh region.
        </p>
      </div>

      <MarketFilterBar
        onSearch={handleSearch}
        isLoading={isLoading}
        initialFilter={lastFilter}
      />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
            >
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
            items={showExpanded ? paginatedItems : paginatedFilteredItems}
            medianPrice={cleanStats.median}
            onAddToDraft={handleAddToDraft}
            onOrderClick={handleOrderClick}
            draftItemMap={draftItemMap}
            onViewDraft={handleViewDraft}
          />
          {filteredItems.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm text-gray-500">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}{" "}
                dari {filteredItems.length} supplier
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={filteredTotalPages}
                onPageChange={handlePageChange}
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
        Keranjang
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
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderQuantityModal
        isOpen={!!orderModalItem}
        onClose={() => setOrderModalItem(null)}
        item={orderModalItem}
        onConfirm={handleOrderConfirm}
      />

      <RadiusWarningModal
        isOpen={!!radiusWarning}
        requested={radiusWarning?.requested ?? 0}
        effective={radiusWarning?.effective ?? 0}
        totalSupplier={radiusWarning?.supplierCount ?? 0}
        filteredCount={
          items.filter(
            (i) => (i.distance ?? 0) <= (radiusWarning?.requested ?? 0),
          ).length
        }
        onExpand={() => {
          setShowExpanded(true);
          setRadiusWarning(null);
          setRequestedRadius(null);
          persistMarketState({ showExpanded: true, requestedRadius: null });
        }}
        onFilter={() => {
          setShowExpanded(false);
          setRadiusWarning(null);
          persistMarketState({ showExpanded: false });
        }}
      />

      <Toast
        message={toastState?.message ?? ""}
        isVisible={toastState !== null}
        onClose={handleCloseToast}
        action={toastState?.action}
      />
    </div>
  );
}
