import { OrderStatus } from "@sigizi/shared";

export type TransactionStatus = OrderStatus | "CANCELLED";

export interface Transaction {
  id: string;
  createdAt: string;
  status: TransactionStatus;
  total: number;
  sppg: { id: string; name: string };
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
  supplier: { id: string; name: string };
  sppg: { id: string; name: string };
  items: TransactionItem[];
  statusHistory: StatusHistoryEntry[];
}

export interface TransactionItem {
  id: string;
  item: { id: string; name: string; unit: string; commodityName?: string; categoryName?: string };
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
  status: string;
}

export const TRANSACTION_STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string }
> = {
  [OrderStatus.PENDING]: {
    label: "Menunggu",
    color: "bg-yellow-100 text-yellow-800",
  },
  [OrderStatus.CONFIRMED]: {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-800",
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

export const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: OrderStatus.PENDING, label: "Menunggu" },
  { value: OrderStatus.CONFIRMED, label: "Dikonfirmasi" },
  { value: OrderStatus.DELIVERED, label: "Dikirim" },
  { value: OrderStatus.COMPLETED, label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
] as const;

export const ITEMS_PER_PAGE = 10;

export function getStatusLabel(status: TransactionStatus): string {
  return TRANSACTION_STATUS_CONFIG[status]?.label ?? status;
}

export function getStatusColor(status: TransactionStatus): string {
  return (
    TRANSACTION_STATUS_CONFIG[status]?.color ?? "bg-gray-100 text-gray-800"
  );
}
