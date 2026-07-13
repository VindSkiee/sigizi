export type BatchStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

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

  // Timestamps
  createdAt: string;
}

export interface BeneficiaryOption {
  id: string;
  name: string;
  portions: number;
}
