// ============================================================================
// Enums — Sesuai Prisma Schema
// ============================================================================

export enum Role {
  SPPG_ADMIN = "SPPG_ADMIN",
  SUPPLIER = "SUPPLIER",
}

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ComplaintStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
}

export enum MouStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

// ============================================================================
// Core Models
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  sppgId?: string;
  supplierId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "createdAt" | "updatedAt"> & {
    sppg?: Sppg;
    supplier?: Supplier;
  };
}

// ============================================================================
// Sppg — Alamat terstruktur + GPS
// ============================================================================

export interface Sppg {
  id: string;
  name: string;
  mitraId?: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Supplier — NIB + Alamat terstruktur + GPS
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  nib: string;
  phone?: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  items?: SupplierItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  supplierId: string;
  createdAt: Date;
}

// ============================================================================
// Beneficiary — Penerima manfaat
// ============================================================================

export interface Beneficiary {
  id: string;
  name: string;
  institution: string;
  institutionType?: string;
  totalBeneficiary: number;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  sppgId: string;
  createdAt: Date;
}

// ============================================================================
// MoU — Memorandum of Understanding / Kontrak Kerjasama
// ============================================================================

export interface Mou {
  id: string;
  mouNumber: string;
  sppgId: string;
  supplierId: string;
  startDate: Date;
  endDate: Date;
  status: MouStatus;
  title: string;
  nibSnapshot?: string;
  terms?: MouTerms;
  documentUrl?: string;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items?: MouItem[];
}

export interface MouTerms {
  paymentTerms?: string;
  deliverySchedule?: string;
  penaltyLateDelivery?: string;
  penaltyDefect?: string;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  customTerms?: string;
}

export interface MouItem {
  id: string;
  mouId: string;
  itemId: string;
  agreedPrice: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  createdAt: Date;
}

// ============================================================================
// Order — Pemesanan dari SPPG ke Supplier
// ============================================================================

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  sppgId: string;
  supplierId: string;
  supplier?: Supplier;
  items?: OrderItem[];
  mouId?: string;
  mou?: Mou;
  createdById: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  item?: SupplierItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ============================================================================
// Batch — Satu kali produksi makanan
// ============================================================================

export interface Batch {
  id: string;
  batchNumber: string;
  reportKey: string;
  date: Date;
  menu: string;
  nutrition?: NutritionInfo;
  allergens: string[];
  beneficiaryCount?: number;
  costPerPortion: number;
  totalCost: number;
  sppgId: string;
  status: BatchStatus;
  createdById: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface BatchPublic {
  batchNumber: string;
  date: string;
  sppg: string;
  menu: string;
  nutrition?: NutritionInfo;
  allergens: string[];
  costPerPortion: number;
  totalCost: number;
  status: BatchStatus;
}

// ============================================================================
// Batch Item — Bahan baku yang digunakan
// ============================================================================

export interface BatchItem {
  id: string;
  batchId: string;
  itemId: string;
  item?: SupplierItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdById: string;
  createdAt: Date;
}

// ============================================================================
// Complaint — Keluhan masyarakat
// ============================================================================

export interface Complaint {
  id: string;
  reportKey: string;
  description: string;
  evidence?: string;
  status: ComplaintStatus;
  notes?: string;
  batchId: string;
  batch?: Batch;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Market Analytics
// ============================================================================

export interface MarketPrice {
  item: string;
  region: string;
  statistics: PriceStatistics;
  suppliers: SupplierPrice[];
}

export interface PriceStatistics {
  min: number;
  max: number;
  median: number;
  mean: number;
  count: number;
}

export interface SupplierPrice {
  id: string;
  name: string;
  price: number;
  isAnomaly: boolean;
}

// ============================================================================
// Reports
// ============================================================================

export interface DailyReport {
  date: string;
  sppg: string;
  summary: ReportSummary;
  batches: Batch[];
  complaints: ComplaintSummary;
}

export interface WeeklyReport {
  week: string;
  sppg: string;
  summary: ReportSummary;
  dailyReports: DailyReport[];
}

export interface ReportSummary {
  totalBatches: number;
  totalCost: number;
  totalPortions: number;
  avgCostPerPortion: number;
}

export interface ComplaintSummary {
  total: number;
  pending: number;
  resolved: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Request Types — Auth
// ============================================================================

export interface LoginSsoRequest {
  code: string;
  state: string;
}

export interface LoginEmailRequest {
  email: string;
  password: string;
}

// ============================================================================
// Request Types — Supplier
// ============================================================================

export interface CreateSupplierRequest {
  name: string;
  nib: string;
  phone?: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface CreateSupplierItemRequest {
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
}

// ============================================================================
// Request Types — Beneficiary
// ============================================================================

export interface CreateBeneficiaryRequest {
  name: string;
  institution: string;
  institutionType?: string;
  totalBeneficiary: number;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// ============================================================================
// Request Types — Batch
// ============================================================================

export interface CreateBatchRequest {
  menu: string;
  nutrition?: NutritionInfo;
  allergens?: string[];
  beneficiaryCount?: number;
  items: BatchItemRequest[];
}

export interface BatchItemRequest {
  itemId: string;
  quantity: number;
}

// ============================================================================
// Request Types — Complaint
// ============================================================================

export interface CreateComplaintRequest {
  reportKey: string;
  description: string;
  evidence?: string;
}

export interface UpdateComplaintRequest {
  status: ComplaintStatus;
  notes?: string;
}

// ============================================================================
// Request Types — Order
// ============================================================================

export interface CreateOrderRequest {
  supplierId: string;
  mouId?: string;
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
}

// ============================================================================
// Request Types — MoU
// ============================================================================

export interface CreateMouRequest {
  sppgId: string;
  supplierId: string;
  title: string;
  startDate: string;
  endDate: string;
  terms?: MouTerms;
  documentUrl?: string;
  notes?: string;
  items: MouItemRequest[];
}

export interface UpdateMouRequest extends Partial<
  Omit<CreateMouRequest, "items">
> {}

export interface MouItemRequest {
  itemId: string;
  agreedPrice: number;
  minOrderQty?: number;
  maxOrderQty?: number;
}

// ============================================================================
// API Constants
// ============================================================================

export const API_VERSION = "v1";
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

// ============================================================================
// Auth
// ============================================================================

export const JWT_EXPIRES_IN = "7d";
export const SSO_STATE_EXPIRY = 600000;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const BCRYPT_ROUNDS = 10;

// ============================================================================
// Batch
// ============================================================================

export const BATCH_NUMBER_FORMAT = "BATCH-{DATE}-{SEQ}";
export const BATCH_DATE_FORMAT = "YYYYMMDD";
export const REPORT_KEY_LENGTH = 8;
export const REPORT_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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
export const DEFAULT_SEARCH_RADIUS_KM = 25;

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
  PASSWORD_TOO_SHORT: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
  EMAIL_ALREADY_REGISTERED: "Email sudah terdaftar",
  INVALID_CREDENTIALS: "Email atau password salah",
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
// Order Status Transitions
// ============================================================================

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
};

// ============================================================================
// Batch Status Transitions
// ============================================================================

export const VALID_BATCH_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  [BatchStatus.ACTIVE]: [BatchStatus.COMPLETED, BatchStatus.CANCELLED],
  [BatchStatus.COMPLETED]: [],
  [BatchStatus.CANCELLED]: [],
};

// ============================================================================
// MoU Status Transitions
// ============================================================================

export const VALID_MOU_TRANSITIONS: Record<MouStatus, MouStatus[]> = {
  [MouStatus.DRAFT]: [MouStatus.ACTIVE, MouStatus.TERMINATED],
  [MouStatus.ACTIVE]: [MouStatus.EXPIRED, MouStatus.TERMINATED],
  [MouStatus.EXPIRED]: [],
  [MouStatus.TERMINATED]: [],
};

// ============================================================================
// Province Options (Indonesia)
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
