"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MarketFilter,
  MarketSupplierItem,
  MarketPriceStatistics,
} from "@/components/features/admin/market/types";
import { getMarketState, saveMarketState } from "@/lib/market-persist";
import {
  getMarketPrices,
  getSupplierItems,
  MarketLocationParams,
} from "@/lib/api";

export interface RadiusInfo {
  requested: number;
  effective: number;
  sampleCount: number;
}

interface UseMarketDataReturn {
  items: MarketSupplierItem[];
  filter: MarketFilter | null;
  rawStats: MarketPriceStatistics | null;
  cleanStats: MarketPriceStatistics | null;
  searchedItem: string;
  isLoading: boolean;
  isRefetching: boolean;
  hasSearched: boolean;
  error: string | null;
  radiusInfo: RadiusInfo | null;
  apiFilter: MarketLocationParams | null;
  handleSearch: (filter: MarketFilter) => Promise<void>;
  handleRefresh: () => Promise<void>;
  dismissRadiusWarning: () => void;
}

export function useMarketData(): UseMarketDataReturn {
  const { token, user } = useAuth();

  const [items, setItems] = useState<MarketSupplierItem[]>([]);
  const [filter, setFilter] = useState<MarketFilter | null>(null);
  const [rawStats, setRawStats] = useState<MarketPriceStatistics | null>(null);
  const [cleanStats, setCleanStats] = useState<MarketPriceStatistics | null>(
    null,
  );
  const [searchedItem, setSearchedItem] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawRadiusInfo, setRawRadiusInfo] = useState<RadiusInfo | null>(null);
  const [radiusWarningDismissed, setRadiusWarningDismissed] = useState(false);
  const [apiFilter, setApiFilter] = useState<MarketLocationParams | null>(
    null,
  );

  const backgroundFetchRef = useRef<string | null>(null);

  const radiusInfo = useMemo(() => {
    if (radiusWarningDismissed) return null;
    return rawRadiusInfo;
  }, [rawRadiusInfo, radiusWarningDismissed]);

  const dismissRadiusWarning = useCallback(() => {
    setRadiusWarningDismissed(true);
  }, []);

  const fetchMarketData = useCallback(
    async (filter: MarketFilter, isBackground: boolean = false) => {
      if (!token) return null;

      try {
        // Bagian filter lokasi (tanpa item) - dipakai untuk request & diekspos
        // sebagai apiFilter agar scope validasi harga saat order konsisten dgn
        // persentase yg ditampilkan di MarketCard.
        const locationFilter: MarketLocationParams = {
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
          marketName:
            filter.locationMode === "region" && filter.marketName
              ? filter.marketName
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
        };

        const response = await getMarketPrices(token, {
          item: filter.item,
          ...locationFilter,
        });

        if (!response.success) {
          if (!isBackground) {
            setError("Gagal memuat data harga pasar");
            setItems([]);
          }
          return null;
        }

        // Simpan scope filter lokasi yg dipakai untuk fetch ini
        setApiFilter(locationFilter);

        const data = response.data as any;
        const rawSuppliers = (data.suppliers || []) as any[];

        const uniqueSupplierIds = [
          ...new Set(rawSuppliers.map((s) => s.supplierId)),
        ];
        const supplierItemsMap = new Map<string, any[]>();

        await Promise.allSettled(
          uniqueSupplierIds.map(async (sid) => {
            try {
              const res = await getSupplierItems(token!, sid);
              if (res.success) {
                const itemsData = res.data as any;
                supplierItemsMap.set(sid, itemsData?.items || itemsData || []);
              }
            } catch {
              // ignore
            }
          }),
        );

        const mapped = rawSuppliers.map((s: any) => {
          const supplierItems =
            supplierItemsMap.get(s.supplierId || s.id) || [];
          const searchedName = filter.item.toLowerCase();
          const matchedItem = supplierItems.find((it: any) =>
            it.name?.toLowerCase().includes(searchedName),
          );

          return {
            id: s.id,
            itemId: s.itemId || matchedItem?.id || "",
            supplierId: s.supplierId || s.id,
            supplierName: s.name ?? "-",
            itemName: matchedItem?.name ?? filter.item,
            unit: matchedItem?.unit ?? "-",
            price: s.price,
            isAnomaly: s.isAnomaly,
            distance: s.distanceKm,
            description: matchedItem?.description ?? undefined,
            minOrderQty: matchedItem?.minOrderQty ?? 1,
            orderStep: matchedItem?.orderStep ?? 1,
            address: s.address ?? undefined,
            province: s.province ?? undefined,
            regency: s.regency ?? undefined,
            district: s.district ?? undefined,
            latitude: s.latitude ?? undefined,
            longitude: s.longitude ?? undefined,
            isMarketSeller: s.isMarketSeller ?? false,
            marketName: s.marketName ?? undefined,
            isSimulation: s.isSimulation ?? false,
          };
        });

        return {
          items: mapped,
          rawStats: (data.statistics?.raw ||
            null) as MarketPriceStatistics | null,
          cleanStats: (data.statistics?.clean ||
            null) as MarketPriceStatistics | null,
          effectiveRadiusKm: (data.effectiveRadiusKm ?? null) as number | null,
          sampleCount: (data.sampleCount ?? 0) as number,
        };
      } catch (err) {
        console.error("Failed to fetch market prices:", err);
        if (!isBackground) {
          setError("Gagal memuat data harga pasar");
          setItems([]);
        }
        return null;
      }
    },
    [token, user],
  );

  const handleSearch = useCallback(
    async (newFilter: MarketFilter) => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setFilter(newFilter);
      setRadiusWarningDismissed(false);
      setRawRadiusInfo(null);

      const result = await fetchMarketData(newFilter, false);

      if (result) {
        setItems(result.items);
        setRawStats(result.rawStats);
        setCleanStats(result.cleanStats);
        setSearchedItem(newFilter.item);

        if (
          newFilter.locationMode === "gps" &&
          newFilter.radiusKm &&
          result.effectiveRadiusKm !== null
        ) {
          const requested = parseFloat(newFilter.radiusKm);
          const effective = result.effectiveRadiusKm;
          if (effective > requested) {
            setRawRadiusInfo({
              requested,
              effective,
              sampleCount: result.sampleCount,
            });
          }
        }

        saveMarketState({
          filter: newFilter,
          items: result.items,
          rawStats: result.rawStats,
          cleanStats: result.cleanStats,
          searchedItem: newFilter.item,
          currentPage: 1,
          showExpanded: true,
          requestedRadius: null,
          error: null,
        });
      }

      setIsLoading(false);
    },
    [fetchMarketData],
  );

  useEffect(() => {
    const init = async () => {
      const cached = getMarketState();

      if (cached && cached.items.length > 0 && cached.filter) {
        setFilter(cached.filter);
        setItems(cached.items);
        setRawStats(cached.rawStats);
        setCleanStats(cached.cleanStats);
        setSearchedItem(cached.searchedItem);
        setHasSearched(true);
        setIsLoading(false);

        const cacheKey = JSON.stringify(cached.filter);
        if (backgroundFetchRef.current !== cacheKey) {
          backgroundFetchRef.current = cacheKey;
          setIsRefetching(true);

          const freshData = await fetchMarketData(cached.filter, true);

          if (freshData) {
            setItems(freshData.items);
            setRawStats(freshData.rawStats);
            setCleanStats(freshData.cleanStats);

            saveMarketState({
              filter: cached.filter,
              items: freshData.items,
              rawStats: freshData.rawStats,
              cleanStats: freshData.cleanStats,
              searchedItem: cached.searchedItem,
              currentPage: cached.currentPage,
              showExpanded: cached.showExpanded,
              requestedRadius: cached.requestedRadius,
              error: null,
            });
          }

          setIsRefetching(false);
          backgroundFetchRef.current = null;
        }
      }
    };

    init();
  }, [fetchMarketData]);

  const handleRefresh = useCallback(async () => {
    if (!filter || isRefetching) return;

    setIsRefetching(true);
    setError(null);

    const result = await fetchMarketData(filter, false);

    if (result) {
      setItems(result.items);
      setRawStats(result.rawStats);
      setCleanStats(result.cleanStats);

      saveMarketState({
        filter,
        items: result.items,
        rawStats: result.rawStats,
        cleanStats: result.cleanStats,
        searchedItem,
        currentPage: 1,
        showExpanded: true,
        requestedRadius: null,
        error: null,
      });
    }

    setIsRefetching(false);
  }, [filter, isRefetching, fetchMarketData, searchedItem]);

  return {
    items,
    filter,
    rawStats,
    cleanStats,
    searchedItem,
    isLoading,
    isRefetching,
    hasSearched,
    error,
    radiusInfo,
    apiFilter,
    handleSearch,
    handleRefresh,
    dismissRadiusWarning,
  };
}
