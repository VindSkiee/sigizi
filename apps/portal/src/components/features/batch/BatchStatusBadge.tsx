import type { BatchStatus } from './types';

interface BatchStatusBadgeProps {
  status: BatchStatus;
}

const STATUS_CONFIG: Record<BatchStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Aktif',
    className: 'bg-yellow-100 text-yellow-700',
  },
  COMPLETED: {
    label: 'Selesai',
    className: 'bg-green-100 text-green-700',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    className: 'bg-red-100 text-red-700',
  },
};

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
