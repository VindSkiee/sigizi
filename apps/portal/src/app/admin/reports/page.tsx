"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReportFilter,
  ReportStats,
  InvoiceRow as InvoiceRowType,
  ManualExpense,
  MANUAL_EXPENSE_KEY,
  DEFAULT_FILTER,
} from "@/components/features/admin/reports/types";
import { MOCK_INVOICES } from "@/components/features/admin/reports/mockData";
import { ReportHeader } from "@/components/features/admin/reports/ReportHeader";
import { ReportFilterBar } from "@/components/features/admin/reports/ReportFilterBar";
import { ReportStatsCards } from "@/components/features/admin/reports/ReportStatsCards";
import { InvoiceTable } from "@/components/features/admin/reports/InvoiceTable";
import { ManualExpenseModal } from "@/components/features/admin/reports/ManualExpenseModal";
import { BgnReportModal } from "@/components/features/admin/reports/BgnReportModal";
import { generateBgnReport } from "@/components/features/admin/reports/generateBgnReport";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

function getManualExpenses(): ManualExpense[] {
  try {
    return JSON.parse(localStorage.getItem(MANUAL_EXPENSE_KEY) || "[]");
  } catch {
    return [];
  }
}

function filterByDate(rows: InvoiceRowType[], date: string): InvoiceRowType[] {
  return rows.filter((r) => r.date === date);
}

function filterByDateRange(
  rows: InvoiceRowType[],
  start: string,
  end: string,
): InvoiceRowType[] {
  return rows.filter((r) => r.date >= start && r.date <= end);
}

function getAllRows(manualExpenses: ManualExpense[]): InvoiceRowType[] {
  const allRows: InvoiceRowType[] = [...MOCK_INVOICES];

  const stored = getManualExpenses();
  const manualRows: InvoiceRowType[] = stored.map((e) => ({
    id: e.id,
    date: e.date,
    ref: `#MANUAL-${e.id.slice(-2).toUpperCase()}`,
    category: e.description,
    nominal: e.amount,
    statusBukti: e.fileUrl || "Manual",
    fileUrl: e.fileUrl,
    isManual: true,
  }));
  allRows.push(...manualRows);

  const sessionRows: InvoiceRowType[] = manualExpenses.map((e) => ({
    id: e.id,
    date: e.date,
    ref: `#MANUAL-${e.id.slice(-2).toUpperCase()}`,
    category: e.description,
    nominal: e.amount,
    statusBukti: "Terekam Sistem",
    isManual: true,
  }));
  allRows.push(...sessionRows);

  return allRows;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBgnModal, setShowBgnModal] = useState(false);
  const [manualExpenses, setManualExpenses] = useState<ManualExpense[]>([]);

  // Auto-load today's data on mount
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  const displayRows = useMemo(() => {
    const allRows = getAllRows(manualExpenses);
    return filterByDate(allRows, filter.date).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [filter, manualExpenses]);

  const stats: ReportStats = useMemo(() => {
    const supplierInvoices = displayRows.filter((r) => !r.isManual);
    const manualInvoices = displayRows.filter((r) => r.isManual);
    return {
      totalPengeluaran: supplierInvoices.reduce((s, r) => s + r.nominal, 0),
      invoiceCount: supplierInvoices.length,
      totalPorsi: 1250,
      totalTambahan: manualInvoices.reduce((s, r) => s + r.nominal, 0),
    };
  }, [displayRows]);

  const handleFilter = useCallback((newFilter: ReportFilter) => {
    setIsLoading(true);
    setFilter(newFilter);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  const handleGenerateBgn = useCallback(
    (startDate: string, endDate: string) => {
      const allRows = getAllRows(manualExpenses);
      const rangeRows = filterByDateRange(allRows, startDate, endDate).sort(
        (a, b) => a.date.localeCompare(b.date),
      );
      const supplierInvoices = rangeRows.filter((r) => !r.isManual);
      const manualInvoices = rangeRows.filter((r) => r.isManual);
      const rangeStats: ReportStats = {
        totalPengeluaran: supplierInvoices.reduce((s, r) => s + r.nominal, 0),
        invoiceCount: supplierInvoices.length,
        totalPorsi: 1250,
        totalTambahan: manualInvoices.reduce((s, r) => s + r.nominal, 0),
      };
      generateBgnReport(
        rangeRows,
        rangeStats,
        { date: filter.date },
        user?.sppg,
        startDate,
        endDate,
      );
    },
    [manualExpenses, filter, user?.sppg],
  );

  const handleSaveManual = useCallback((expense: ManualExpense) => {
    setManualExpenses((prev) => [...prev, expense]);
  }, []);

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
          <ReportStatsCards stats={stats} />
          <InvoiceTable
            rows={displayRows}
            onInputManual={() => setShowManualModal(true)}
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
