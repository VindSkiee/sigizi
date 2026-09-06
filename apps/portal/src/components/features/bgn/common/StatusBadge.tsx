import type {
  OrderStatus,
  SPPGStatus,
  AnomalyStatus,
} from "@/lib/bgn-mock-data";

type AnyStatus =
  OrderStatus | SPPGStatus | AnomalyStatus | "Paid" | "Pending" | "Failed";

const statusConfig: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  PENDING: { bg: "#F1F5F9", color: "#475569", label: "Menunggu" },
  CONFIRMED: { bg: "#EFF6FF", color: "#1D4ED8", label: "Dikonfirmasi" },
  DELIVERED: { bg: "#F0FDF4", color: "#15803D", label: "Terkirim" },
  COMPLETED: { bg: "#F0FDF4", color: "#15803D", label: "Selesai" },
  CANCELLED: { bg: "#FEF2F2", color: "#DC2626", label: "Dibatalkan" },
  Active: { bg: "#F0FDF4", color: "#15803D", label: "Aktif" },
  "Low Activity": {
    bg: "#FFFBEB",
    color: "#B45309",
    label: "Aktivitas Rendah",
  },
  "High Cancellation": {
    bg: "#FEF2F2",
    color: "#DC2626",
    label: "Pembatalan Tinggi",
  },
  "Requires Review": { bg: "#FEF2F2", color: "#DC2626", label: "Perlu Tinjau" },
  New: { bg: "#EFF6FF", color: "#1D4ED8", label: "Baru" },
  Reviewing: { bg: "#FFFBEB", color: "#B45309", label: "Ditinjau" },
  Resolved: { bg: "#F0FDF4", color: "#15803D", label: "Selesai" },
  Dismissed: { bg: "#F8FAFC", color: "#94A3B8", label: "Diabaikan" },
  Paid: { bg: "#F0FDF4", color: "#15803D", label: "Lunas" },
  Pending: { bg: "#FFFBEB", color: "#B45309", label: "Tertunda" },
  Failed: { bg: "#FEF2F2", color: "#DC2626", label: "Gagal" },
};

interface Props {
  status: AnyStatus;
  small?: boolean;
}

export default function StatusBadge({ status, small }: Props) {
  const cfg = statusConfig[status] || {
    bg: "#F1F5F9",
    color: "#64748B",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full whitespace-nowrap ${small ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "var(--font-body)",
      }}
    >
      {cfg.label}
    </span>
  );
}
