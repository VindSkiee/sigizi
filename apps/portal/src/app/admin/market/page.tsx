"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  MarketFilter,
  MarketSupplierItem,
  MarketSortOption,
  HETReference,
} from "@/components/features/admin/market/types";
import { MarketFilterBar } from "@/components/features/admin/market/MarketFilterBar";
import { MarketStatsBar } from "@/components/features/admin/market/MarketStatsBar";
import { MarketSortFilter } from "@/components/features/admin/market/MarketSortFilter";
import { MarketCardGrid } from "@/components/features/admin/market/MarketCardGrid";
import { HETReferenceList } from "@/components/features/admin/market/HETReferenceList";
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
import { saveMarketState } from "@/lib/market-persist";
import { useMarketData } from "@/hooks/useMarketData";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHETReferences,
  addHETReference,
  removeHETReference,
} from "@/lib/het-reference";

const ITEMS_PER_PAGE = 9;

export default function MarketPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    items,
    filter: lastFilter,
    rawStats,
    cleanStats,
    searchedItem,
    isLoading,
    isRefetching,
    hasSearched,
    error,
    radiusInfo,
    handleSearch: handleSearchFromHook,
    dismissRadiusWarning,
  } = useMarketData();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<MarketSortOption>("default");
  const [showExpanded, setShowExpanded] = useState(true);
  const [requestedRadius, setRequestedRadius] = useState<number | null>(null);

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [toastState, setToastState] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);
  const [orderModalItem, setOrderModalItem] =
    useState<MarketSupplierItem | null>(null);
  const [hetReferences, setHetReferences] = useState<HETReference[]>([]);

  useEffect(() => {
    setDraftItems(getDraftItems());
    setHetReferences(getHETReferences());
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
      setCurrentPage(1);
      setSortOption("default");
      setShowExpanded(true);
      setRequestedRadius(null);
      await handleSearchFromHook(filter);
    },
    [handleSearchFromHook],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      persistMarketState({ currentPage: page });
    },
    [persistMarketState],
  );

  const filteredItems = useMemo(() => {
    const base =
      showExpanded || !requestedRadius
        ? items
        : items.filter((item) => (item.distance ?? 0) <= requestedRadius);

    switch (sortOption) {
      case "price_desc":
        return [...base].sort((a, b) => b.price - a.price);
      case "price_asc":
        return [...base].sort((a, b) => a.price - b.price);
      case "distance_asc":
        return [...base].sort(
          (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
        );
      default:
        return base;
    }
  }, [items, sortOption, requestedRadius, showExpanded]);

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

  const handleUseAsReference = useCallback(
    (dataSource: "clean" | "raw") => {
      const stats = dataSource === "clean" ? cleanStats : rawStats;
      if (!stats || !lastFilter) return;

      const ref: Omit<HETReference, "id" | "createdAt"> = {
        item: searchedItem,
        location: {
          regency: lastFilter.regency,
          district: lastFilter.district || undefined,
          market: lastFilter.marketName || undefined,
        },
        dataSource,
        maxPrice: stats.max,
        medianPrice: stats.median,
      };

      const updated = addHETReference(ref);
      setHetReferences(updated);
    },
    [cleanStats, rawStats, lastFilter, searchedItem],
  );

  const handleRemoveReference = useCallback((id: string) => {
    const updated = removeHETReference(id);
    setHetReferences(updated);
  }, []);

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pasar Bahan Baku</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mt-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && hasSearched && !error && rawStats && cleanStats && (
        <>
          <MarketStatsBar
            rawStats={rawStats}
            cleanStats={cleanStats}
            item={searchedItem}
            onUseAsReference={handleUseAsReference}
          />

          {isRefetching && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <svg
                className="animate-spin h-4 w-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-xs text-amber-700">
                Memperbarui data harga terkini...
              </p>
            </div>
          )}

          <MarketSortFilter
            value={sortOption}
            onChange={setSortOption}
            hasDistanceData={items.some((item) => item.distance != null)}
          />

          <HETReferenceList
            references={hetReferences}
            onRemove={handleRemoveReference}
          />

          <MarketCardGrid
            items={paginatedFilteredItems}
            medianPrice={cleanStats.median}
            onAddToDraft={handleAddToDraft}
            onOrderClick={handleOrderClick}
            draftItemMap={draftItemMap}
            onViewDraft={handleViewDraft}
            isRefetching={isRefetching}
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

      {!hasSearched && !isLoading && (
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

      <motion.button
        key={draftItems.length}
        onClick={() => setShowDraftModal(true)}
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.15, 1],
          transition: { duration: 0.4, ease: "easeInOut" },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
        <AnimatePresence mode="wait">
          {draftItems.length > 0 && (
            <motion.span
              key={draftItems.length}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.3, 1],
                opacity: 1,
                transition: {
                  type: "spring",
                  damping: 15,
                  stiffness: 400,
                  mass: 0.6,
                },
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-white text-primary-600 rounded-full"
            >
              {draftItems.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

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
        isOpen={!!radiusInfo}
        requested={radiusInfo?.requested ?? 0}
        effective={radiusInfo?.effective ?? 0}
        totalSupplier={radiusInfo?.sampleCount ?? 0}
        filteredCount={
          items.filter((i) => (i.distance ?? 0) <= (radiusInfo?.requested ?? 0))
            .length
        }
        onExpand={() => {
          setShowExpanded(true);
          setRequestedRadius(null);
          dismissRadiusWarning();
          persistMarketState({ showExpanded: true, requestedRadius: null });
        }}
        onFilter={() => {
          setShowExpanded(false);
          setRequestedRadius(radiusInfo?.requested ?? null);
          dismissRadiusWarning();
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
