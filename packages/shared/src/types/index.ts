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
  // Alamat
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  // GPS
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
  nib: string; // File URL/path ke scan NIB
  phone?: string;
  // Alamat
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  // GPS
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
  // Masa kontrak
  startDate: Date;
  endDate: Date;
  // Status
  status: MouStatus;
  // Dokumen & ketentuan
  title: string;
  nibSnapshot?: string;
  terms?: MouTerms;
  documentUrl?: string;
  notes?: string;
  // Audit
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  items?: MouItem[];
}

export interface MouTerms {
  paymentTerms?: string; // "NET-30", "COD", "NET-14"
  deliverySchedule?: string; // "Setiap Senin & Kamis"
  penaltyLateDelivery?: string; // "5% per hari keterlambatan"
  penaltyDefect?: string; // "Penggantian 2x lipat"
  minOrderAmount?: number; // Minimum nilai order per transaksi
  maxOrderAmount?: number; // Maksimum nilai order per bulan
  customTerms?: string; // Ketentuan lainnya
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
  // Link ke MoU (opsional)
  mouId?: string;
  mou?: Mou;
  // Audit
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

// ============================================================================
// Request Types — Supplier
// ============================================================================

export interface CreateSupplierRequest {
  name: string;
  nib: string;
  phone?: string;
  // Alamat
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  // GPS
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
  mouId?: string; // Opsional: jika order berdasarkan MoU
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
