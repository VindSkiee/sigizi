"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReportFilter,
  ReportStats,
  InvoiceRow as InvoiceRowType,
  ExpenseSource,
  FinancialSourceType,
  OrderItemDetail,
  DEFAULT_FILTER,
} from "@/components/features/admin/reports/types";
import { ReportHeader } from "@/components/features/admin/reports/ReportHeader";
import { ReportFilterBar } from "@/components/features/admin/reports/ReportFilterBar";
import { ReportStatsCards } from "@/components/features/admin/reports/ReportStatsCards";
import { InvoiceTable } from "@/components/features/admin/reports/InvoiceTable";
import { ManualExpenseModal } from "@/components/features/admin/reports/ManualExpenseModal";
import { BgnReportModal } from "@/components/features/admin/reports/BgnReportModal";
import { generateBgnReport } from "@/components/features/admin/reports/generateBgnReport";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { getExpenseBreakdown, createOperationalExpense } from "@/lib/api";

interface FinancialLogEntry {
  source: FinancialSourceType;
  date: string;
  referenceId: string;
  title: string;
  description?: string | null;
  amount: number;
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

interface ExpenseBreakdownResponse {
  source: string;
  sppgId: string;
  startDate: string;
  endDate: string;
  items: FinancialLogEntry[];
  summary: {
    totalCogs: number;
    totalProcured: number;
    totalOpex: number;
    grandTotal: number;
  };
}

function filterItemsBySource(
  items: FinancialLogEntry[],
  source: ExpenseSource,
): FinancialLogEntry[] {
  if (source === "CASH") {
    return items.filter(
      (item) => item.source === "PROCUREMENT" || item.source === "OPEX",
    );
  }
  if (source === "PRODUCTION") {
    return items.filter((item) => item.source === "COGS");
  }
  return items;
}

function mapToInvoiceRows(items: FinancialLogEntry[]): InvoiceRowType[] {
  return items.map((item) => ({
    id: item.referenceId,
    date: item.date,
    ref:
      item.source === "PROCUREMENT"
        ? `#ORD-${item.referenceId.slice(-6).toUpperCase()}`
        : item.source === "COGS"
          ? `#BATCH-${item.meta?.batchNumber || item.referenceId.slice(-6).toUpperCase()}`
          : `#OPEX-${item.referenceId.slice(-6).toUpperCase()}`,
    supplierName: item.source === "PROCUREMENT" ? item.title : undefined,
    category: item.description || item.title,
    nominal: item.amount,
    statusBukti: "Terekam Sistem",
    isManual: item.source === "OPEX",
    source: item.source,
    meta: item.meta,
  }));
}

export default function ReportsPage() {
  const { user, token } = useAuth();
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBgnModal, setShowBgnModal] = useState(false);
  const [allItems, setAllItems] = useState<FinancialLogEntry[]>([]);
  const [summary, setSummary] = useState({
    totalCogs: 0,
    totalProcured: 0,
    totalOpex: 0,
    grandTotal: 0,
  });

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await getExpenseBreakdown(token, {
        source: "ALL",
        startDate: filter.startDate,
        endDate: filter.endDate,
      });

      if (response.success) {
        const data = response.data as ExpenseBreakdownResponse;
        setAllItems(data.items);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch expense breakdown:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, filter.startDate, filter.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(
    () => filterItemsBySource(allItems, filter.source),
    [allItems, filter.source],
  );

  const displayRows = useMemo(
    () =>
      mapToInvoiceRows(filteredItems).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    [filteredItems],
  );

  const stats: ReportStats = useMemo(() => {
    const totalPortions = allItems
      .filter((item) => item.source === "COGS")
      .reduce((sum, item) => sum + (item.meta?.beneficiaryCount || 0), 0);

    return {
      totalPengeluaran: summary.totalProcured + summary.totalOpex,
      invoiceCount: allItems.filter(
        (item) => item.source === "PROCUREMENT" || item.source === "OPEX",
      ).length,
      totalPorsi: totalPortions,
      totalTambahan: summary.totalOpex,
      totalCogs: summary.totalCogs,
      totalProcured: summary.totalProcured,
      totalOpex: summary.totalOpex,
    };
  }, [allItems, summary]);

  const handleFilter = useCallback((newFilter: ReportFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSaveManual = useCallback(
    async (expense: {
      category: string;
      amount: number;
      expenseDate: string;
      description: string;
      evidenceUrl?: string;
    }) => {
      if (!token) throw new Error("Not authenticated");

      await createOperationalExpense(token, expense);
      await fetchData();
    },
    [token, fetchData],
  );

  const handleGenerateBgn = useCallback(
    (startDate: string, endDate: string) => {
      const rangeRows = mapToInvoiceRows(filteredItems)
        .filter((r) => r.date >= startDate && r.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date));

      generateBgnReport(
        rangeRows,
        stats,
        filter,
        user?.sppg,
        startDate,
        endDate,
      );
    },
    [filteredItems, stats, filter, user?.sppg],
  );

  return (
    <div className="max-w-7xl mx-auto">
      <ReportHeader onOpenBgnModal={() => setShowBgnModal(true)} />

      <ReportFilterBar onFilter={handleFilter} isLoading={isLoading} />

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-3 flex-1" />
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-4 py-4">
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 flex-1" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <ReportStatsCards stats={stats} activeSource={filter.source} />
          <InvoiceTable
            rows={displayRows}
            onInputManual={() => setShowManualModal(true)}
            activeSource={filter.source}
          />
        </>
      )}

      <ManualExpenseModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSave={handleSaveManual}
      />

      <BgnReportModal
        isOpen={showBgnModal}
        onClose={() => setShowBgnModal(false)}
        onGenerate={handleGenerateBgn}
      />
    </div>
  );
}
