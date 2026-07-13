export type PeriodType = "daily" | "weekly";

export interface ReportFilter {
  periodType: PeriodType;
  date: string;
  weekStart?: string;
  weekLabel?: string;
}

export interface ReportStats {
  totalPengeluaran: number;
  invoiceCount: number;
  totalPorsi: number;
  totalTambahan: number;
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
}

export interface ManualExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  fileUrl?: string;
}

export const MANUAL_EXPENSE_KEY = "sigizi_manual_expenses";

export const DEFAULT_FILTER: ReportFilter = {
  periodType: "daily",
  date: new Date().toISOString().slice(0, 10),
};
