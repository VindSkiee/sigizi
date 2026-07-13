export interface MarketFilter {
  province: string;
  regency: string;
  district: string;
  radius: number;
  item: string;
}

export interface MarketSupplierItem {
  id: string;
  supplierId: string;
  supplierName: string;
  itemName: string;
  unit: string;
  price: number;
  isAnomaly: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
  mou?: boolean;
}

export interface MarketStats {
  total: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

export const DEFAULT_FILTER: MarketFilter = {
  province: "",
  regency: "",
  district: "",
  radius: 25,
  item: "",
};

export const SPPG_DEFAULT_LOCATION = {
  latitude: -6.5569,
  longitude: 107.4448,
  name: "SPPG Purwakarta",
};
