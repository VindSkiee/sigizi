export type BatchStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface BatchMenuItem {
  name: string;
  weight: string;
}

export interface BatchManagement {
  id: string;
  batchNumber: string;
  reportKey: string;
  status: BatchStatus;

  // Delivery info
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPortions: number;
  deliveryDate: string;
  deliveryTimeStart: string;
  deliveryTimeEnd: string;

  // Menu
  cycle: string;
  menus: BatchMenuItem[];

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
