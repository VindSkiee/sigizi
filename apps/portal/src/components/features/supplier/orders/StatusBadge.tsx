import { OrderStatusWithCancel, StatusConfig } from "./types";

const STATUS_CONFIG: Record<OrderStatusWithCancel, StatusConfig> = {
  PENDING: {
    label: "BARU",
    badgeClass: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    tabLabel: "Baru",
  },
  CONFIRMED: {
    label: "DIPROSES",
    badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
    tabLabel: "Diproses",
  },
  DELIVERED: {
    label: "DIKIRIM",
    badgeClass: "bg-purple-100 text-purple-700 border border-purple-200",
    tabLabel: "Dikirim",
  },
  COMPLETED: {
    label: "SELESAI",
    badgeClass: "bg-green-100 text-green-700 border border-green-200",
    tabLabel: "Selesai",
  },
  CANCELLED: {
    label: "DIBATALKAN",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    tabLabel: "Batal",
  },
};

interface StatusBadgeProps {
  status: OrderStatusWithCancel;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${config.badgeClass} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
