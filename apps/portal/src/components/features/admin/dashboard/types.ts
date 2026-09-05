import { OrderStatus } from "@sigizi/shared";

export type TransactionStatus = OrderStatus | "CANCELLED";

export interface DashboardStats {
  totalSuppliers: number;
  totalOrders: number;
  totalSpend: number;
  orderStatusCounts: Record<string, number>;
}

export interface RecentTransaction {
  id: string;
  createdAt: string;
  status: TransactionStatus;
  total: number;
  supplier: { id: string; name: string };
}

export const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    color: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-400",
  },
  [OrderStatus.CONFIRMED]: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
  },
  [OrderStatus.DELIVERED]: {
    label: "Dikirim",
    color: "bg-purple-100 text-purple-800",
    dot: "bg-purple-400",
  },
  [OrderStatus.COMPLETED]: {
    label: "Selesai",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800",
    dot: "bg-red-400",
  },
};

export function getStatusLabel(status: string): string {
  return ORDER_STATUS_META[status]?.label ?? status;
}

export function getStatusColor(status: string): string {
  return ORDER_STATUS_META[status]?.color ?? "bg-gray-100 text-gray-800";
}

export function getStatusDot(status: string): string {
  return ORDER_STATUS_META[status]?.dot ?? "bg-gray-400";
}
