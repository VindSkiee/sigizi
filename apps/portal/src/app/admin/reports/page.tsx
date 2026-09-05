"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReportFilter,
  ReportStats,
  InvoiceRow as InvoiceRowType,
  ExpenseSource,
  DEFAULT_FILTER,
  OPEX_CATEGORIES,
} from "@/components/features/admin/reports/types";
import { ReportHeader } from "@/components/features/admin/reports/ReportHeader";
import { ReportFilterBar } from "@/components/features/admin/reports/ReportFilterBar";
import { ReportStatsCards } from "@/components/features/admin/reports/ReportStatsCards";
import { InvoiceTable } from "@/components/features/admin/reports/InvoiceTable";
import { ManualExpenseModal } from "@/components/features/admin/reports/ManualExpenseModal";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { listOperationalExpenses, createOperationalExpense } from "@/lib/api";

interface OpExEntry {
  id: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  notes?: string;
  createdAt: string;
}

interface OpExListResponse {
  items: OpExEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function mapToInvoiceRows(items: OpExEntry[]): InvoiceRowType[] {
  return items.map((item) => ({
    id: item.id,
    date: item.expenseDate,
    ref: `#OPEX-${item.id.slice(-6).toUpperCase()}`,
    category:
      OPEX_CATEGORIES.find((c) => c.value === item.category)?.label ||
      item.category,
    description: item.description,
    nominal: item.amount,
    statusBukti: "Terekam Sistem",
    isManual: true,
    source: "OPEX" as const,
    meta: { category: item.category },
  }));
}

export default function ReportsPage() {
  const { user, token } = useAuth();
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [allItems, setAllItems] = useState<OpExEntry[]>([]);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await listOperationalExpenses(token, {
        startDate: filter.startDate,
        endDate: filter.endDate,
        limit: 100,
      });

      if (response.success) {
        const data = response.data as OpExListResponse;
        setAllItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch operational expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, filter.startDate, filter.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayRows = useMemo(
    () =>
      mapToInvoiceRows(allItems).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    [allItems],
  );

  const stats: ReportStats = useMemo(() => {
    const totalOpex = allItems.reduce((sum, item) => sum + item.amount, 0);

    // Find top category
    const categoryCounts: Record<string, number> = {};
    allItems.forEach((item) => {
      const label =
        OPEX_CATEGORIES.find((c) => c.value === item.category)?.label ||
        item.category;
      categoryCounts[label] = (categoryCounts[label] || 0) + item.amount;
    });
    const topCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] || "";

    return {
      totalOpex,
      opexCount: allItems.length,
      topCategory,
    };
  }, [allItems]);

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

  return (
    <div className="max-w-7xl mx-auto">
      <ReportHeader />

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
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-3 flex-1" />
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-4 py-4">
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((j) => (
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
    </div>
  );
}
