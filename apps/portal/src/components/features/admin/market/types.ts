export type LocationMode = "region" | "gps";

export type MarketSortOption =
  | "default"
  | "price_desc"
  | "price_asc"
  | "distance_asc"
  | "stock_desc"
  | "freshness_desc";

export interface MarketFilter {
  item: string;
  categoryId: string;
  commodityId: string;
  locationMode: LocationMode;
  province: string;
  regency: string;
  district: string;
  marketName: string;
  radiusKm: string;
}

export interface MarketPriceStatistics {
  min: number;
  max: number;
  median: number;
  mean: number;
  count: number;
}

export interface MarketPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MarketSupplierItem {
  id: string;
  itemId: string;
  supplierId: string;
  supplierName: string;
  itemName?: string;
  unit?: string;
  price: number;
  isAnomaly: boolean;
  distance?: number;
  mou?: boolean;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  address?: string;
  province?: string;
  regency?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  isMarketSeller?: boolean;
  marketName?: string;
  isSimulation?: boolean;
  stock?: number;
  image?: string;
  profileImage?: string;
  commodityId?: string;
  commodityName?: string;
  categoryName?: string;
  openStatus?: boolean;
  priceUpdatedAt?: string;
  stockUpdatedAt?: string;
  meta?: Record<string, unknown>;
}

export interface MarketPriceResponse {
  item: string;
  region: string;
  statistics: MarketPriceStatistics;
  cleanStatistics: MarketPriceStatistics;
  suppliers: MarketSupplierItem[];
}

export interface MarketStats {
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
}

export interface HETReference {
  id: string;
  item: string;
  location: {
    regency: string;
    district?: string;
    market?: string;
  };
  dataSource: "clean" | "raw";
  maxPrice: number;
  medianPrice: number;
  createdAt: number;
}

export const DEFAULT_FILTER: MarketFilter = {
  item: "",
  categoryId: "",
  commodityId: "",
  locationMode: "region",
  province: "",
  regency: "",
  district: "",
  marketName: "",
  radiusKm: "25",
};
