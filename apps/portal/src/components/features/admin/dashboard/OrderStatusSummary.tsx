import { getStatusLabel, getStatusDot, ORDER_STATUS_META } from "./types";
import type { DashboardStats } from "./types";

interface OrderStatusSummaryProps {
  stats: DashboardStats;
  loading?: boolean;
}

const STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export function OrderStatusSummary({ stats, loading }: OrderStatusSummaryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Pesanan</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUS_ORDER.map((status) => {
          const meta = ORDER_STATUS_META[status];
          const count = stats.orderStatusCounts[status] ?? 0;
          return (
            <div
              key={status}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(status)}`} />
              <div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{meta?.label ?? status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
