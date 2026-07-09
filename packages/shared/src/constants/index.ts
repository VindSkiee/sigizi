import { Role, BatchStatus, ComplaintStatus, OrderStatus } from "../types";

// API
export const API_VERSION = "v1";
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// Auth
export const JWT_EXPIRES_IN = "7d";
export const SSO_STATE_EXPIRY = 600000; // 10 minutes

// Batch
export const BATCH_NUMBER_FORMAT = "BATCH-{DATE}-{SEQ}";
export const BATCH_DATE_FORMAT = "YYYYMMDD";
export const REPORT_KEY_LENGTH = 8;
export const REPORT_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1

// Supplier
export const NPWP_MIN_LENGTH = 10;
export const NPWP_MAX_LENGTH = 15;

// Complaint
export const COMPLAINT_MAX_DESCRIPTION_LENGTH = 1000;

// Reports
export const DAILY_REPORT_NAME = "Laporan Harian";
export const WEEKLY_REPORT_NAME = "Laporan Mingguan";

// Role Permissions
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.SPPG_ADMIN]: [
    "supplier:read",
    "supplier:write",
    "market:read",
    "batch:read",
    "batch:write",
    "complaint:read",
    "complaint:write",
    "report:read",
    "report:download",
    "order:read",
    "order:write",
  ],
  [Role.SUPPLIER]: [
    "supplier:read:own",
    "supplier:write:own",
    "item:read:own",
    "item:write:own",
    "order:read:own",
    "order:write:own",
  ],
  [Role.PUBLIC]: [
    "batch:read:public",
    "complaint:write",
  ],
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Field ini wajib diisi",
  INVALID_EMAIL: "Format email tidak valid",
  INVALID_NPWP: "NPWP harus 10-15 digit",
  INVALID_REPORT_KEY: "Report Key tidak valid",
  BATCH_NOT_FOUND: "Batch tidak ditemukan",
  REPORT_KEY_MISMATCH: "Report Key tidak cocok dengan batch",
  UNAUTHORIZED: "Anda tidak memiliki akses",
  NOT_FOUND: "Data tidak ditemukan",
  DUPLICATE: "Data sudah ada",
} as const;

// Allergen Options
export const ALLERGEN_OPTIONS = [
  { value: "gluten", label: "Gluten" },
  { value: "kacang", label: "Kacang" },
  { value: "susu", label: "Susu" },
  { value: "telur", label: "Telur" },
  { value: "seafood", label: "Seafood" },
  { value: "kedelai", label: "Kedelai" },
] as const;

// Unit Options
export const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Mililiter" },
  { value: "pcs", label: "Pieces" },
  { value: "pack", label: "Pack" },
] as const;
