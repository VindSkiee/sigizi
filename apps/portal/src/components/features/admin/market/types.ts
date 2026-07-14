export interface MarketFilter {
  item: string;
  regency: string;
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
  supplierId: string;
  supplierName: string;
  itemName: string;
  unit: string;
  price: number;
  isAnomaly: boolean;
  distance?: number;
  mou?: boolean;
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
  regency: "",
};
