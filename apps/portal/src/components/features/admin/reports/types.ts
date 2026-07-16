export type ExpenseSource = "CASH" | "PRODUCTION" | "ALL";

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
  totalPengeluaran: number;
  invoiceCount: number;
  totalPorsi: number;
  totalTambahan: number;
  totalCogs: number;
  totalProcured: number;
  totalOpex: number;
}

export interface InvoiceRow {
  id: string;
  date: string;
  ref: string;
  supplierName?: string;
  category: string;
  nominal: number;
  statusBukti: string;
  fileUrl?: string;
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

export const MANUAL_EXPENSE_KEY = "sigizi_manual_expenses";

const today = new Date().toISOString().slice(0, 10);
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

export const DEFAULT_FILTER: ReportFilter = {
  startDate: sevenDaysAgo,
  endDate: today,
  source: "CASH",
};

export const SOURCE_LABELS: Record<ExpenseSource, string> = {
  CASH: "Pengeluaran Kas",
  PRODUCTION: "Biaya Produksi",
  ALL: "Semua",
};

export const SOURCE_DESCRIPTIONS: Record<ExpenseSource, string> = {
  CASH: "Pembayaran pesanan + biaya operasional",
  PRODUCTION: "Biaya bahan yang dikonsumsi batch",
  ALL: "Seluruh transaksi keuangan",
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
