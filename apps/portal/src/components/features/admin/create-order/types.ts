export interface SupplierSearchResult {
  id: string;
  name: string;
  price: number;
  unit: string;
  isAnomaly: boolean;
}

export interface DraftItem {
  draftId: string;
  addedAt: number;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  minOrderQty?: number;
  orderStep?: number;
  stock?: number;
}

export interface MarketPricesResponse {
  item: string;
  filter: {
    province: string | null;
    regency: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    radiusKm: number | null;
  };
  scopeUsed: string;
  sampleCount: number;
  effectiveRadiusKm?: number | null;
  statistics: {
    raw: {
      min: number;
      max: number;
      median: number;
      mean: number;
      count: number;
    };
    clean: {
      min: number;
      max: number;
      median: number;
      mean: number;
      count: number;
    };
  };
  suppliers: SupplierSearchResult[];
}
