// Enums
export enum Role {
  SPPG_ADMIN = "SPPG_ADMIN",
  SUPPLIER = "SUPPLIER",
  PUBLIC = "PUBLIC",
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
}

// User & Auth
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

// SPPG
export interface Sppg {
  id: string;
  name: string;
  mitraId?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier
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
  basePrice: number;
  supplierId: string;
  createdAt: Date;
}

// Beneficiary
export interface Beneficiary {
  id: string;
  name: string;
  school: string;
  sppgId: string;
  createdAt: Date;
}

// Batch
export interface Batch {
  id: string;
  batchNumber: string;
  reportKey: string;
  date: Date;
  menu: string;
  nutrition?: NutritionInfo;
  allergens: string[];
  costPerPortion: number;
  totalCost: number;
  sppgId: string;
  status: BatchStatus;
  createdAt: Date;
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

// Complaint
export interface Complaint {
  id: string;
  reportKey: string;
  description: string;
  evidence?: string;
  status: ComplaintStatus;
  batchId: string;
  batch?: Batch;
  createdAt: Date;
  updatedAt: Date;
}

// Order
export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  sppgId: string;
  supplierId: string;
  supplier?: Supplier;
  items?: OrderItem[];
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

// Market Analytics
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

// Reports
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

// API Response Types
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

// Request Types
export interface LoginSsoRequest {
  code: string;
  state: string;
}

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
}

export interface CreateBatchRequest {
  menu: string;
  nutrition?: NutritionInfo;
  allergens?: string[];
  costPerPortion: number;
  totalCost: number;
  beneficiaryCount?: number;
}

export interface CreateComplaintRequest {
  reportKey: string;
  description: string;
  evidence?: string;
}

export interface UpdateComplaintRequest {
  status: ComplaintStatus;
  notes?: string;
}

export interface CreateOrderRequest {
  supplierId: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  itemId: string;
  quantity: number;
}
