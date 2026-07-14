"use client";

import { useState, useCallback, useMemo } from "react";
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

function filterByDateRange(rows: InvoiceRowType[], start: string, end: string): InvoiceRowType[] {
  return rows.filter((r) => r.date >= start && r.date <= end);
}

function filterBySingleDate(rows: InvoiceRowType[], date: string): InvoiceRowType[] {
  return rows.filter((r) => r.date === date);
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualExpenses, setManualExpenses] = useState<ManualExpense[]>([]);

  const displayRows = useMemo(() => {
    if (!hasFiltered) return [];

    const allRows: InvoiceRowType[] = [...MOCK_INVOICES];

    // Add manual expenses from localStorage
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

    // Add current session manual expenses
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

    if (filter.periodType === "daily") {
      return filterBySingleDate(allRows, filter.date).sort(
        (a, b) => a.date.localeCompare(b.date)
      );
    }

    // Weekly
    if (filter.weekStart) {
      const endDate = new Date(filter.weekStart);
      endDate.setDate(endDate.getDate() + 6);
      const endStr = endDate.toISOString().slice(0, 10);
      return filterByDateRange(allRows, filter.weekStart, endStr).sort(
        (a, b) => a.date.localeCompare(b.date)
      );
    }

    return allRows;
  }, [filter, hasFiltered, manualExpenses]);

  const stats: ReportStats = useMemo(() => {
    const supplierInvoices = displayRows.filter((r) => !r.isManual);
    const manualInvoices = displayRows.filter((r) => r.isManual);
    return {
      totalPengeluaran: supplierInvoices.reduce((s, r) => s + r.nominal, 0),
      invoiceCount: supplierInvoices.length,
      totalPorsi: filter.periodType === "daily" ? 1250 : 8750,
      totalTambahan: manualInvoices.reduce((s, r) => s + r.nominal, 0),
    };
  }, [displayRows, filter.periodType]);

  const handleFilter = useCallback((newFilter: ReportFilter) => {
    setIsLoading(true);
    setFilter(newFilter);
    setTimeout(() => {
      setHasFiltered(true);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleGeneratePDF = useCallback(() => {
    if (displayRows.length === 0) return;
    generateBgnReport(displayRows, stats, filter, user?.sppg);
  }, [displayRows, stats, filter, user?.sppg]);

  const handleSaveManual = useCallback((expense: ManualExpense) => {
    setManualExpenses((prev) => [...prev, expense]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <ReportHeader onGeneratePDF={handleGeneratePDF} />

      <ReportFilterBar onFilter={handleFilter} isLoading={isLoading} />

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
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

      {hasFiltered && !isLoading && (
        <>
          <ReportStatsCards stats={stats} />
          <InvoiceTable rows={displayRows} onInputManual={() => setShowManualModal(true)} />
        </>
      )}

      {!hasFiltered && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm mb-1">Pilih periode laporan dan klik &quot;Terapkan Filter&quot;</p>
          <p className="text-gray-400 text-xs">Data invoice supplier akan otomatis ditampilkan</p>
        </div>
      )}

      <ManualExpenseModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSave={handleSaveManual}
      />
    </div>
  );
}
