export type StockType = 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'DISPOSAL' | 'EXPIRED';

export interface InventoryStock {
  id: string;
  itemId: string;
  itemName: string;
  itemUnit: string;
  batchNumber?: string;
  supplierId?: string;
  supplierName?: string;
  purchasePrice: number;
  initialQty: number;
  currentQty: number;
  expiredAt?: string;
  notes?: string;
  sppgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBalance {
  itemId: string;
  itemName: string;
  itemUnit: string;
  totalQty: number;
  avgPrice: number;
  totalValue: number;
}

export interface InventoryValuation {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  expiringSoonCount: number;
}

export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentQty: number;
  minQty: number;
  alertType: 'LOW_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
  message: string;
}

export interface StockHistory {
  id: string;
  stockId: string;
  type: StockType;
  qtyChange: number;
  qtyAfter: number;
  price?: number;
  notes?: string;
  createdAt: string;
}
