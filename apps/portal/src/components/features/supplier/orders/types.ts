// Order types for Supplier Portal
// Backend will add CANCELLED status to OrderStatus enum

export type OrderStatusWithCancel = "PENDING" | "CONFIRMED" | "DELIVERED" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  item: {
    id: string;
    name: string;
    unit: string;
    basePrice: number;
  };
}

export interface Order {
  id: string;
  status: OrderStatusWithCancel;
  total: number;
  notes?: string;
  sppgId: string;
  supplierId: string;
  createdAt: string;
  updatedAt: string;
  sppg: {
    id: string;
    name: string;
  };
  supplier: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

export interface OrderViewModel {
  id: string;
  orderNumber: string;
  sppgName: string;
  supplierName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }[];
  total: number;
  status: OrderStatusWithCancel;
  createdAt: string;
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  tabLabel: string;
}

export type FilterType = "all" | OrderStatusWithCancel;
