import { OrderStatus } from "@sigizi/shared";

export type TransactionDisplayStatus = "DIBAYAR" | "BELUM_BAYAR" | "CANCELLED";

export interface Transaction {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  supplier: { id: string; name: string };
  itemCount: number;
  paidAt: string | null;
}

export interface TransactionDetail extends Transaction {
  notes: string;
  updatedAt: string;
  cancelledAt: string | null;
  cancelledReason: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  supplier: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    profileImage?: string;
  };
  sppg: { id: string; name: string };
  items: TransactionItem[];
  statusHistory: StatusHistoryEntry[];
}

export interface TransactionItem {
  id: string;
  item: {
    id: string;
    name: string;
    unit: string;
    commodityName?: string;
    categoryName?: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  marketMedianAtPurchase: number | null;
  isWarningBypass: boolean;
  justificationNote: string | null;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface TransactionFilter {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status: TransactionDisplayStatus | "ALL";
}

export const TRANSACTION_STATUS_CONFIG: Record<
  TransactionDisplayStatus,
  { label: string; color: string }
> = {
  DIBAYAR: {
    label: "Dibayar",
    color: "bg-green-100 text-green-800",
  },
  BELUM_BAYAR: {
    label: "Belum Bayar",
    color: "bg-gray-100 text-gray-600",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-100 text-red-800",
  },
};

export const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "DIBAYAR", label: "Dibayar" },
  { value: "BELUM_BAYAR", label: "Belum Bayar" },
  { value: "CANCELLED", label: "Dibatalkan" },
] as const;

export const ITEMS_PER_PAGE = 10;

export function getDisplayStatus(
  status: OrderStatus,
  paidAt: string | null,
): TransactionDisplayStatus {
  if (status === "COMPLETED" && paidAt) return "DIBAYAR";
  if (status === "DELIVERED" && !paidAt) return "BELUM_BAYAR";
  if (status === "CANCELLED") return "CANCELLED";
  return "BELUM_BAYAR";
}

export function getStatusLabel(status: TransactionDisplayStatus): string {
  return TRANSACTION_STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusColor(status: TransactionDisplayStatus): string {
  return (
    TRANSACTION_STATUS_CONFIG[status]?.color ?? "bg-gray-100 text-gray-800"
  );
}
