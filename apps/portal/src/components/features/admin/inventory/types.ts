export type StockSource = "SYSTEM_ORDER" | "MANUAL_ADJUSTMENT" | "BATCH_RETURN";

export interface InventoryStock {
  id: string;
  itemId: string;
  sppgId: string;
  source: StockSource;
  purchasePrice: number;
  initialQty: number;
  remainingQty: number;
  expiredAt?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  item: { id: string; name: string; unit: string };
  createdBy: { id: string; name: string };
  adjustments: InventoryAdjustment[];
}

export interface InventoryAdjustment {
  id: string;
  adjustmentQty: number;
  reason: string;
  description?: string;
  createdAt: string;
  changedBy: { name: string };
}

export interface InventoryValuationItem {
  itemId: string;
  itemName: string;
  unit: string;
  totalQty: number;
  totalValue: number;
}

export interface InventoryValuation {
  totalValue: number;
  items: InventoryValuationItem[];
}

export interface InventoryBalanceItem {
  item: { id: string; name: string; unit: string; minThreshold?: number };
  totalRemaining: number;
  totalInitial: number;
  lotCount: number;
}

export interface InventoryAlertItem {
  item: { id: string; name: string; unit: string; minThreshold?: number };
  totalRemaining: number;
  totalInitial: number;
  lotCount: number;
  threshold: number;
  isLow: boolean;
}

export interface StockHistoryData {
  stock: {
    id: string;
    itemId: string;
    initialQty: number;
    remainingQty: number;
    item: { name: string; unit: string };
  };
  adjustments: StockHistoryAdjustment[];
}

export interface StockHistoryAdjustment {
  id: string;
  adjustmentQty: number;
  reason: string;
  description?: string;
  createdAt: string;
  changedBy: { name: string };
}
