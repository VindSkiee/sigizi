import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getStatusLabel, getStatusColor, type RecentTransaction } from "./types";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
  loading?: boolean;
}

export function RecentTransactions({
  transactions,
  loading,
}: RecentTransactionsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Transaksi Terakhir
        </h2>
        <Link
          href="/admin/transactions"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Semua
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Belum ada transaksi
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">
                  Supplier
                </th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="py-2.5 text-gray-600 whitespace-nowrap">
                    {formatDateTime(t.createdAt)}
                  </td>
                  <td className="py-2.5 font-medium text-gray-900">
                    {t.supplier.name}
                  </td>
                  <td className="py-2.5 text-right font-medium text-gray-900">
                    {formatCurrency(t.total)}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}
                    >
                      {getStatusLabel(t.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
