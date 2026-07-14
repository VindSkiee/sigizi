export type ComplaintFilterTab = "ALL" | "PENDING" | "REVIEWED" | "RESOLVED";

export interface ComplaintBatch {
  id: string;
  batchNumber: string;
  menu: string;
  sppg: {
    id: string;
    name: string;
  };
}

export interface ComplaintAdmin {
  id: string;
  reportKey: string;
  description: string;
  evidence?: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  notes?: string;
  batch: ComplaintBatch;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintStats {
  pendingCount: number;
  reviewedCount: number;
  resolvedCount: number;
  totalCount: number;
}

export const COMPLAINT_STATUS_CONFIG: Record<
  ComplaintAdmin["status"],
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Perlu Ditinjau",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  REVIEWED: {
    label: "Ditinjau",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  RESOLVED: {
    label: "Selesai",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
};
