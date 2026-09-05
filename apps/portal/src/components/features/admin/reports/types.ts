export type ExpenseSource = "OPEX" | "MARKET" | "ALL";

export type FinancialSourceType = "PROCUREMENT" | "COGS" | "OPEX";

export interface OrderItemDetail {
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  source: ExpenseSource;
}

export interface ReportStats {
  totalOpex: number;
  opexCount: number;
  topCategory: string;
}

export interface InvoiceRow {
  id: string;
  date: string;
  ref: string;
  category: string;
  description: string;
  nominal: number;
  statusBukti: string;
  isManual: boolean;
  source: FinancialSourceType;
  meta?: {
    batchId?: string;
    batchNumber?: string;
    orderId?: string;
    quantity?: number;
    unit?: string;
    beneficiaryCount?: number;
    category?: string;
    orderItems?: OrderItemDetail[];
  };
}

export interface ManualExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  fileUrl?: string;
  category?: string;
}

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

export const DEFAULT_FILTER: ReportFilter = {
  startDate: thirtyDaysAgo,
  endDate: today,
  source: "ALL",
};

export const SOURCE_LABELS: Record<ExpenseSource, string> = {
  OPEX: "Pengeluaran Operasional",
  MARKET: "Referensi Harga Pasar",
  ALL: "Semua",
};

export const SOURCE_DESCRIPTIONS: Record<ExpenseSource, string> = {
  OPEX: "Biaya operasional (bensin, transport, administrasi, dll)",
  MARKET: "Data harga pasar untuk referensi pengadaan",
  ALL: "Ringkasan pengeluaran dan harga pasar",
};

export const FINANCIAL_SOURCE_CONFIG: Record<
  FinancialSourceType,
  { label: string; color: string; bgColor: string }
> = {
  PROCUREMENT: {
    label: "Pesanan",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  COGS: {
    label: "Batch",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  OPEX: {
    label: "Operasional",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
};

export const OPEX_CATEGORIES = [
  { value: "TRANSPORTATION", label: "Transportasi" },
  { value: "FUEL", label: "Bahan Bakar" },
  { value: "VEHICLE_MAINTENANCE", label: "Perawatan Kendaraan" },
  { value: "ADMINISTRATIVE", label: "Administrasi" },
  { value: "UTILITIES", label: "Utilitas (Listrik/Air)" },
  { value: "OTHER", label: "Lainnya" },
] as const;
