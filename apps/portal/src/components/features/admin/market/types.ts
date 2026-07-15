export type LocationMode = "region" | "gps";

export interface MarketFilter {
  item: string;
  locationMode: LocationMode;
  province: string;
  regency: string;
  district: string;
  radiusKm: string;
}

export interface MarketPriceStatistics {
  min: number;
  max: number;
  median: number;
  mean: number;
  count: number;
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

export const POPULAR_ITEMS = [
  "Beras",
  "Daging Ayam",
  "Daging Sapi",
  "Ikan Lele",
  "Ikan Tongkol",
  "Telur Ayam",
  "Minyak Goreng",
  "Gula Pasir",
  "Tepung Terigu",
  "Sayur Bayam",
  "Sayur Kangkung",
  "Tempe",
  "Tahu",
];

export const DEFAULT_FILTER: MarketFilter = {
  item: "",
  locationMode: "region",
  province: "",
  regency: "",
  district: "",
  radiusKm: "25",
};
