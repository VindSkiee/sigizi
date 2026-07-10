import { Role, BatchStatus, ComplaintStatus, OrderStatus, InventoryTransactionType } from "../types";

// ============================================================================
// API
// ============================================================================

export const API_VERSION = "v1";
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// ============================================================================
// Auth
// ============================================================================

export const JWT_EXPIRES_IN = "7d";
export const SSO_STATE_EXPIRY = 600000; // 10 minutes

// ============================================================================
// Batch
// ============================================================================

export const BATCH_NUMBER_FORMAT = "BATCH-{DATE}-{SEQ}";
export const BATCH_DATE_FORMAT = "YYYYMMDD";
export const REPORT_KEY_LENGTH = 8;
export const REPORT_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1

// ============================================================================
// Supplier
// ============================================================================

export const NPWP_MIN_LENGTH = 10;
export const NPWP_MAX_LENGTH = 15;

// ============================================================================
// Complaint
// ============================================================================

export const COMPLAINT_MIN_DESCRIPTION_LENGTH = 10;
export const COMPLAINT_MAX_DESCRIPTION_LENGTH = 1000;

// ============================================================================
// Reports
// ============================================================================

export const DAILY_REPORT_NAME = "Laporan Harian";
export const WEEKLY_REPORT_NAME = "Laporan Mingguan";

// ============================================================================
// Role Permissions
// ============================================================================

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
    "inventory:read",
    "beneficiary:read",
    "beneficiary:write",
  ],
  [Role.SUPPLIER]: [
    "supplier:read:own",
    "supplier:write:own",
    "item:read:own",
    "item:write:own",
    "order:read:own",
    "order:write:own",
    "stocklot:read:own",
  ],
  // PUBLIC dihapus — public endpoint tidak memerlukan role
};

// ============================================================================
// Validation Messages — Bahasa Indonesia
// ============================================================================

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
  NAME_TOO_SHORT: "Nama minimal 2 karakter",
  DESCRIPTION_TOO_SHORT: "Deskripsi minimal 10 karakter",
  QUANTITY_MUST_POSITIVE: "Jumlah harus lebih dari 0",
  PRICE_MUST_POSITIVE: "Harga tidak boleh negatif",
  STOCK_INSUFFICIENT: "Stok tidak mencukupi",
  STOCK_LOT_NOT_FOUND: "Stock lot tidak ditemukan",
  ORDER_NOT_FOUND: "Order tidak ditemukan",
  ORDER_STATUS_INVALID: "Transisi status tidak valid",
  SUPPLIER_NOT_FOUND: "Supplier tidak ditemukan",
  BENEFICIARY_NOT_FOUND: "Penerima manfaat tidak ditemukan",
} as const;

// ============================================================================
// Institution Types
// ============================================================================

export const INSTITUTION_TYPES = [
  { value: "SEKOLAH", label: "Sekolah" },
  { value: "PANTI_ASUHAN", label: "Panti Asuhan" },
  { value: "PESANTREN", label: "Pesantren" },
  { value: "RUMAH_SAKIT", label: "Rumah Sakit" },
  { value: "POSYANDU", label: "Posyandu" },
  { value: "PUSKESMAS", label: "Puskesmas" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

// ============================================================================
// Allergen Options
// ============================================================================

export const ALLERGEN_OPTIONS = [
  { value: "gluten", label: "Gluten" },
  { value: "kacang", label: "Kacang" },
  { value: "susu", label: "Susu" },
  { value: "telur", label: "Telur" },
  { value: "seafood", label: "Seafood" },
  { value: "kedelai", label: "Kedelai" },
] as const;

// ============================================================================
// Unit Options
// ============================================================================

export const UNIT_OPTIONS = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Mililiter" },
  { value: "pcs", label: "Pieces" },
  { value: "pack", label: "Pack" },
  { value: "botol", label: "Botol" },
  { value: "karton", label: "Karton" },
] as const;

// ============================================================================
// Inventory Transaction Types
// ============================================================================

export const INVENTORY_TRANSACTION_TYPES: Record<InventoryTransactionType, string> = {
  [InventoryTransactionType.IN]: "Penerimaan dari supplier",
  [InventoryTransactionType.OUT]: "Pengeluaran untuk batch",
};

export const INVENTORY_REFERENCE_TYPES = {
  ORDER_DELIVERY: "ORDER_DELIVERY",
  BATCH_CONSUMPTION: "BATCH_CONSUMPTION",
} as const;

// ============================================================================
// Order Status Transitions — Valid flow
// ============================================================================

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

// ============================================================================
// Batch Status Transitions — Valid flow
// ============================================================================

export const VALID_BATCH_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  [BatchStatus.ACTIVE]: [BatchStatus.COMPLETED, BatchStatus.CANCELLED],
  [BatchStatus.COMPLETED]: [],
  [BatchStatus.CANCELLED]: [],
};

// ============================================================================
// Anti-Fraud Constants
// ============================================================================

export const HASH_ALGORITHM = "sha256";
export const HASH_SEPARATOR = "|";
export const HASH_FIELDS_FOR_BATCH = ["id", "totalCost", "sppgId", "date", "createdById"] as const;
