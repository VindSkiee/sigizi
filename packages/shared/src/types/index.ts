// ============================================================================
// Enums — Sesuai Prisma Schema
// ============================================================================

export enum Role {
  SPPG_ADMIN = "SPPG_ADMIN",
  SUPPLIER = "SUPPLIER",
  // PUBLIC dihapus — user tidak login tidak memiliki User record
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

export enum InventoryTransactionType {
  IN = "IN",     // Penerimaan barang dari supplier
  OUT = "OUT",   // Pengeluaran barang untuk batch
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

export interface Sppg {
  id: string;
  name: string;
  mitraId?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Supplier & Items
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  npwp: string;
  phone?: string;
  address?: string;
  items?: SupplierItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;        // Harga catalogue (bisa berubah)
  description?: string;     // Deskripsi item
  minOrderQty?: number;     // Minimum order
  orderStep?: number;       // Kelipatan order
  supplierId: string;
  createdAt: Date;
}

// ============================================================================
// Beneficiary — Penerima manfaat
// ============================================================================

export interface Beneficiary {
  id: string;
  name: string;               // Nama kelompok/cabang
  institution: string;        // Nama institusi (bukan hanya sekolah)
  institutionType?: string;   // SEKOLAH, PANTI_ASUHAN, PESANTREN, dll
  totalBeneficiary: number;   // Jumlah orang penerima manfaat
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  sppgId: string;
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
  unitPrice: number;       // Harga saat order (snapshot)
  purchasePrice: number;   // Harga final yang disepakati (frozen)
  subtotal: number;
}

// ============================================================================
// Order Status History — Audit trail
// ============================================================================

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  notes?: string;
  evidenceUrl?: string;
  changedById: string;
  changedBy?: User;
  createdAt: Date;
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
  costPerPortion: number;   // Computed: totalCost / beneficiaryCount
  totalCost: number;        // Computed: SUM(BatchItem.subtotal)
  sppgId: string;
  status: BatchStatus;
  createdById: string;
  updatedById?: string;
  dataHash?: string;        // SHA-256 anti-tampering (Phase 2)
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
  stockLotId: string;
  stockLot?: StockLot;
  itemId: string;
  item?: SupplierItem;
  quantity: number;
  unitPrice: number;       // Frozen dari StockLot.purchasePrice
  subtotal: number;
  createdById: string;
  createdAt: Date;
}

// ============================================================================
// Stock Lot — Buku Besar Stok (Append-Only)
// ============================================================================

export interface StockLot {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  itemId: string;
  item?: SupplierItem;
  orderId: string;
  order?: Order;
  orderItemId: string;
  orderItem?: OrderItem;
  purchasePrice: number;   // Harga frozen dari OrderItem
  unit: string;
  originalQty: number;     // Qty awal saat diterima
  remainingQty: number;    // Sisa stok
  receivedAt: Date;
  createdById: string;
  createdBy?: User;
  createdAt: Date;
}

// ============================================================================
// Inventory Transaction — Append-Only Ledger
// ============================================================================

export interface InventoryTransaction {
  id: string;
  type: InventoryTransactionType;
  stockLotId: string;
  stockLot?: StockLot;
  batchItemId?: string;
  batchItem?: BatchItem;
  quantity: number;
  referenceType: string;   // ORDER_DELIVERY | BATCH_CONSUMPTION
  referenceId: string;
  notes?: string;
  createdById?: string;
  createdBy?: User;
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
  npwp: string;
  phone?: string;
  address?: string;
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
  items: BatchItemRequest[];   // Bahan baku yang digunakan
}

export interface BatchItemRequest {
  itemId: string;
  quantity: number;
  // unitPrice diambil otomatis dari StockLot (FIFO)
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
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
}

// ============================================================================
// Request Types — Inventory
// ============================================================================

export interface ReceiveDeliveryRequest {
  orderId: string;
  items: ReceiveDeliveryItemRequest[];
}

export interface ReceiveDeliveryItemRequest {
  orderItemId: string;
  quantity: number;
}
