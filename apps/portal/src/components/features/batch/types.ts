export type BatchStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface BatchMenuItem {
  name: string;
  weight: string;
}

export interface BatchFormItem {
  itemId: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface InventoryBalanceItem {
  item: {
    id: string;
    name: string;
    unit: string;
    minThreshold?: number;
  };
  totalRemaining: number;
  totalInitial: number;
  lotCount: number;
}

export interface BatchManagement {
  id: string;
  batchNumber: string;
  reportKey: string;
  status: BatchStatus;

  // Delivery info
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryNames: string[];
  beneficiaryPortions: number;
  deliveryDate: string;
  deliveryTimeStart: string;
  deliveryTimeEnd: string;

  // Menu
  menu: string;
  cycle: string;
  allergens: string[];
  menus: BatchMenuItem[];
  batchItems: BatchFormItem[];

  // Budget (Regulasi MBG Rp 10.000/porsi)
  beneficiaryCount?: number;
  costPerPortion?: number;
  costPerPortionStandard: number;
  totalBudget: number;
  totalCost?: number;
  budgetVariance?: number;

  // Failure tracking
  failedReason?: string;
  failedEvidence?: string;

  // Timestamps
  createdAt: string;
}

export interface BeneficiaryOption {
  id: string;
  name: string;
  portions: number;
}
