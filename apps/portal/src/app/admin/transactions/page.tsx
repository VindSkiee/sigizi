"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions, getTransactionById } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { TransactionStatsCards } from "@/components/features/admin/transactions/TransactionStatsCards";
import { TransactionFilterBar } from "@/components/features/admin/transactions/TransactionFilterBar";
import { TransactionTable } from "@/components/features/admin/transactions/TransactionTable";
import { TransactionDetailModal } from "@/components/features/admin/transactions/TransactionDetailModal";
import {
  type Transaction,
  type TransactionDetail,
  type TransactionFilter,
  type TransactionDisplayStatus,
  getDisplayStatus,
  ITEMS_PER_PAGE,
} from "@/components/features/admin/transactions/types";

function getDefaultDateRange() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { start: formatDate(startDate), end: formatDate(now) };
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const defaultDateRange = getDefaultDateRange();

  const [filter, setFilter] = useState<TransactionFilter>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    startDate: defaultDateRange.start,
    endDate: defaultDateRange.end,
    status: "ALL",
  });

  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    data: TransactionDetail | null;
    loading: boolean;
  }>({ isOpen: false, data: null, loading: false });

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const allItems: any[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const res = await getTransactions(token, {
          page,
          limit: 100,
          startDate: filter.startDate,
          endDate: filter.endDate,
        });
        const data = res.data as any;
        allItems.push(...(data.items ?? []));
        totalPages = data.pagination?.totalPages ?? 1;
        page++;
      }

      setRawTransactions(allItems);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [token, filter.startDate, filter.endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const visible = rawTransactions.filter((t) => {
      const ds = getDisplayStatus(t.status, t.paidAt);
      return ds === "DIBAYAR" || ds === "BELUM_BAYAR" || ds === "CANCELLED";
    });

    if (filter.status === "ALL") return visible;
    return visible.filter((t) => {
      const ds = getDisplayStatus(t.status, t.paidAt);
      return ds === filter.status;
    });
  }, [rawTransactions, filter.status]);

  const paginatedTransactions = useMemo(() => {
    const start = (filter.page - 1) * filter.limit;
    return filteredTransactions.slice(start, start + filter.limit);
  }, [filteredTransactions, filter.page, filter.limit]);

  const totalPagesCalc = Math.ceil(filteredTransactions.length / filter.limit);

  useEffect(() => {
    setTotalPages(totalPagesCalc);
    setTotalItems(filteredTransactions.length);
  }, [totalPagesCalc, filteredTransactions.length]);

  useEffect(() => {
    if (filter.page > totalPages && totalPages > 0) {
      setFilter((prev) => ({ ...prev, page: totalPages }));
    }
  }, [totalPages, filter.page]);

  const handleFilterChange = (partial: Partial<TransactionFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const handleRowClick = async (id: string) => {
    if (!token) return;
    setDetailModal({ isOpen: true, data: null, loading: true });
    try {
      const res = await getTransactionById(token, id);
      setDetailModal({
        isOpen: true,
        data: res.data as TransactionDetail,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch transaction detail:", err);
      setDetailModal({ isOpen: false, data: null, loading: false });
    }
  };

  const displayTransactions = useMemo(() => {
    return paginatedTransactions.map((t) => ({
      ...t,
      displayStatus: getDisplayStatus(t.status, t.paidAt),
    }));
  }, [paginatedTransactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transaksi pembelian bahan baku SPPG Anda
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <TransactionStatsCards transactions={filteredTransactions} />
      )}

      {/* Filter */}
      <TransactionFilterBar
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      {/* Summary */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Menampilkan {paginatedTransactions.length} dari {totalItems} transaksi
        </p>
      )}

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : (
        <TransactionTable
          transactions={displayTransactions}
          onRowClick={handleRowClick}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={filter.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Detail Modal */}
      <TransactionDetailModal
        transaction={detailModal.data}
        isOpen={detailModal.isOpen}
        onClose={() =>
          setDetailModal({ isOpen: false, data: null, loading: false })
        }
      />
    </div>
  );
}
