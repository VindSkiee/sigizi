"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupplierTransactions, getSupplierTransactionById } from "@/lib/api";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";
import { TransactionStatsCards } from "@/components/features/supplier/transactions/TransactionStatsCards";
import { TransactionFilterBar } from "@/components/features/supplier/transactions/TransactionFilterBar";
import { TransactionTable } from "@/components/features/supplier/transactions/TransactionTable";
import { TransactionDetailModal } from "@/components/features/supplier/transactions/TransactionDetailModal";
import {
  type Transaction,
  type TransactionDetail,
  type TransactionFilter,
  ITEMS_PER_PAGE,
} from "@/components/features/supplier/transactions/types";

function getDefaultDateRange() {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { start: formatDate(startDate), end: formatDate(now) };
}

export default function SupplierTransactionsPage() {
  const { token } = useAuth();
  const defaultDateRange = getDefaultDateRange();

  const [filter, setFilter] = useState<TransactionFilter>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    startDate: defaultDateRange.start,
    endDate: defaultDateRange.end,
    status: "ALL",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      const res = await getSupplierTransactions(token, {
        page: filter.page,
        limit: filter.limit,
        startDate: filter.startDate,
        endDate: filter.endDate,
        status: filter.status,
      });
      const data = res.data as any;
      setTransactions(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotalItems(data.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
      const res = await getSupplierTransactionById(token, id);
      setDetailModal({ isOpen: true, data: res.data as TransactionDetail, loading: false });
    } catch (err) {
      console.error("Failed to fetch transaction detail:", err);
      setDetailModal({ isOpen: false, data: null, loading: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Transaksi penjualan bahan baku Anda
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <TransactionStatsCards transactions={transactions} />
      )}

      {/* Filter */}
      <TransactionFilterBar filter={filter} onFilterChange={handleFilterChange} />

      {/* Summary */}
      {!loading && (
        <p className="text-sm text-gray-500">
          Menampilkan {transactions.length} dari {totalItems} transaksi
        </p>
      )}

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={6} />
      ) : (
        <TransactionTable transactions={transactions} onRowClick={handleRowClick} />
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
        onClose={() => setDetailModal({ isOpen: false, data: null, loading: false })}
      />
    </div>
  );
}
