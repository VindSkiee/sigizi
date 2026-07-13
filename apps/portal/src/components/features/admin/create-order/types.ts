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
}

export interface MarketPricesResponse {
  item: string;
  statistics: {
    min: number;
    max: number;
    median: number;
    mean: number;
    count: number;
  };
  suppliers: SupplierSearchResult[];
}
