export type ReportPeriodType = "DAILY" | "WEEKLY" | "MONTHLY";

export const EXPENSE_SOURCE = {
  COGS: "COGS",
  PROCUREMENT: "PROCUREMENT",
  OPEX: "OPEX",
  ALL: "ALL",
} as const;

export type ExpenseSource =
  (typeof EXPENSE_SOURCE)[keyof typeof EXPENSE_SOURCE];

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
  periodKey: string;
}

export interface FinancialLogEntry {
  source: Exclude<ExpenseSource, "ALL">;
  date: string;
  referenceId: string;
  title: string;
  description?: string | null;
  amount: number;
  meta?: Record<string, unknown>;
}

export interface ReportBreakdownSection {
  total: number;
  items: FinancialLogEntry[];
}

export interface OfficialReportPayload {
  id: string;
  sppgId: string;
  sppgName: string | null;
  type: ReportPeriodType;
  periodKey: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "FINAL";
  totals: {
    totalPortions: number;
    totalCogs: number;
    totalProcured: number;
    totalOpex: number;
    budgetVariance: number;
  };
  breakdown: {
    cogs: ReportBreakdownSection;
    procurement: ReportBreakdownSection;
    opex: ReportBreakdownSection;
  };
  pdfPath?: string | null;
  pdfHash?: string | null;
  generatedAt: string;
  finalizedAt: string;
}
