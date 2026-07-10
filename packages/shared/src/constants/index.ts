import {
  Role,
  BatchStatus,
  ComplaintStatus,
  OrderStatus,
  MouStatus,
} from "../types";

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
// MoU
// ============================================================================

export const MOU_NUMBER_FORMAT = "MOU-{DATE}-{SEQ}";
export const MOU_DATE_FORMAT = "YYYYMMDD";

// ============================================================================
// Supplier
// ============================================================================

export const NIB_MIN_LENGTH = 10;
export const NIB_MAX_LENGTH = 50;
export const NIB_MAX_FILE_SIZE_MB = 10;

// ============================================================================
// Address / Geolocation
// ============================================================================

export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;
export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;

export const DEFAULT_SEARCH_RADIUS_KM = 25; // Default radius pencarian supplier

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
    "beneficiary:read",
    "beneficiary:write",
    "mou:read",
    "mou:write",
  ],
  [Role.SUPPLIER]: [
    "supplier:read:own",
    "supplier:write:own",
    "item:read:own",
    "item:write:own",
    "order:read:own",
    "order:write:own",
    "mou:read:own",
  ],
};

// ============================================================================
// Validation Messages — Bahasa Indonesia
// ============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: "Field ini wajib diisi",
  INVALID_EMAIL: "Format email tidak valid",
  INVALID_NIB: "NIB tidak valid",
  NIB_FILE_TOO_LARGE: `Ukuran file NIB maksimal ${NIB_MAX_FILE_SIZE_MB}MB`,
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
  ORDER_NOT_FOUND: "Order tidak ditemukan",
  ORDER_STATUS_INVALID: "Transisi status tidak valid",
  SUPPLIER_NOT_FOUND: "Supplier tidak ditemukan",
  BENEFICIARY_NOT_FOUND: "Penerima manfaat tidak ditemukan",
  PROVINCE_REQUIRED: "Provinsi wajib diisi",
  REGENCY_REQUIRED: "Kabupaten/Kota wajib diisi",
  DISTRICT_REQUIRED: "Kecamatan wajib diisi",
  MOU_NOT_FOUND: "MoU tidak ditemukan",
  MOU_EXPIRED: "MoU sudah tidak berlaku",
  MOU_STATUS_INVALID: "Transisi status MoU tidak valid",
  MOU_DATES_INVALID: "Tanggal sebelum harus sebelum tanggal berakhir",
  MOU_OVERLAP: "MoU aktif sudah ada untuk pasangan SPPG-Supplier ini",
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
// MoU Status Transitions — Valid flow
// ============================================================================

export const VALID_MOU_TRANSITIONS: Record<MouStatus, MouStatus[]> = {
  [MouStatus.DRAFT]: [MouStatus.ACTIVE, MouStatus.TERMINATED],
  [MouStatus.ACTIVE]: [MouStatus.EXPIRED, MouStatus.TERMINATED],
  [MouStatus.EXPIRED]: [],
  [MouStatus.TERMINATED]: [],
};

// ============================================================================
// Province Options (Indonesia — Jawa Barat & sekitarnya)
// ============================================================================

export const PROVINCE_OPTIONS = [
  { value: "ACEH", label: "Aceh" },
  { value: "SUMATERA_UTARA", label: "Sumatera Utara" },
  { value: "SUMATERA_BARAT", label: "Sumatera Barat" },
  { value: "RIAU", label: "Riau" },
  { value: "JAMBI", label: "Jambi" },
  { value: "SUMATERA_SELATAN", label: "Sumatera Selatan" },
  { value: "BENGKULU", label: "Bengkulu" },
  { value: "LAMPUNG", label: "Lampung" },
  { value: "DKI_JAKARTA", label: "DKI Jakarta" },
  { value: "JAWA_BARAT", label: "Jawa Barat" },
  { value: "JAWA_TENGAH", label: "Jawa Tengah" },
  { value: "DI_YOGYAKARTA", label: "DI Yogyakarta" },
  { value: "JAWA_TIMUR", label: "Jawa Timur" },
  { value: "BANTEN", label: "Banten" },
  { value: "BALI", label: "Bali" },
  { value: "NUSA_TENGGARA_BARAT", label: "Nusa Tenggara Barat" },
  { value: "NUSA_TENGGARA_TIMUR", label: "Nusa Tenggara Timur" },
  { value: "KALIMANTAN_BARAT", label: "Kalimantan Barat" },
  { value: "KALIMANTAN_TENGAH", label: "Kalimantan Tengah" },
  { value: "KALIMANTAN_TIMUR", label: "Kalimantan Timur" },
  { value: "KALIMANTAN_SELATAN", label: "Kalimantan Selatan" },
  { value: "SULAWESI_UTARA", label: "Sulawesi Utara" },
  { value: "SULAWESI_TENGAH", label: "Sulawesi Tengah" },
  { value: "SULAWESI_SELATAN", label: "Sulawesi Selatan" },
  { value: "SULAWESI_TENGGARA", label: "Sulawesi Tenggara" },
  { value: "PAPUA", label: "Papua" },
] as const;
