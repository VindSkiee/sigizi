import { OrderStatus } from "@sigizi/shared";

export type OrderStatusWithCancel = OrderStatus | "CANCELLED";
export type OrderFilterTab = "ALL" | "SELESAI" | OrderStatus;

export interface SupplierOrder {
  id: string;
  createdAt: string;
  status: OrderStatusWithCancel;
  total: number;
  notes?: string;
  paidAt?: string;
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
    commodityName?: string;
    categoryName?: string;
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

export type OrderDisplayStatus =
  | OrderStatusWithCancel
  | "DELIVERED_UNPAID"
  | "DELIVERED_PAID";

export const ORDER_STATUS_CONFIG: Record<
  OrderDisplayStatus,
  {
    label: string;
    color: string;
    nextAction?: string;
    nextStatus?: OrderStatus | "PAY" | "CANCEL_ORDER";
    cancelAction?: string;
    cancelStatus?: "CANCEL_ORDER";
  }
> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu Konfirmasi",
    color: "bg-yellow-100 text-yellow-800",
  },
  [OrderStatus.CONFIRMED]: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-800",
    cancelAction: "Batalkan",
    cancelStatus: "CANCEL_ORDER",
  },
  DELIVERED_UNPAID: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
    nextAction: "Konfirmasi Pembayaran",
    nextStatus: "PAY",
    cancelAction: "Batalkan",
    cancelStatus: "CANCEL_ORDER",
  },
  DELIVERED_PAID: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
    nextAction: "Selesai",
    nextStatus: OrderStatus.COMPLETED,
    cancelAction: "Batalkan",
    cancelStatus: "CANCEL_ORDER",
  },
  [OrderStatus.DELIVERED]: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
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

export function getDisplayStatus(
  status: OrderStatusWithCancel,
  paidAt?: string | null,
): OrderDisplayStatus {
  if (status === OrderStatus.DELIVERED) {
    return paidAt ? "DELIVERED_PAID" : "DELIVERED_UNPAID";
  }
  return status;
}
