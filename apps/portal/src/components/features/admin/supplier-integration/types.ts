import { OrderStatus } from "@sigizi/shared";

export type OrderStatusWithCancel = OrderStatus | "CANCELLED";
export type OrderFilterTab = "ALL" | "SELESAI" | OrderStatus;

export interface SupplierOrder {
  id: string;
  createdAt: string;
  status: OrderStatusWithCancel;
  total: number;
  notes?: string;
  estimatedArrival?: string;
  supplier: {
    id: string;
    name: string;
    nib?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }[];
  sppg: {
    id: string;
    name: string;
  };
  mou?: {
    id: string;
    mouNumber: string;
  };
}

export interface SupplierStats {
  pendingCount: number;
  confirmedCount: number;
  deliveredCount: number;
  completedCount: number;
  totalActiveValue: number;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatusWithCancel,
  { label: string; color: string; nextAction?: string; nextStatus?: OrderStatus }
> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu Konfirmasi",
    color: "bg-yellow-100 text-yellow-800",
    nextAction: "Konfirmasi",
    nextStatus: OrderStatus.CONFIRMED,
  },
  [OrderStatus.CONFIRMED]: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-800",
    nextAction: "Tandai Dikirim",
    nextStatus: OrderStatus.DELIVERED,
  },
  [OrderStatus.DELIVERED]: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
    nextAction: "Selesai",
    nextStatus: OrderStatus.COMPLETED,
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    color: "bg-green-100 text-green-800",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800",
  },
};
