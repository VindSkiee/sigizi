import { Supplier } from "../entities/supplier.entity";

export interface FindAllSupplierParams {
  skip?: number;
  take?: number;
  search?: string;
}

export interface CreateSupplierData {
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

export interface UpdateSupplierData {
  name?: string;
  phone?: string;
  address?: string;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface SupplierItemData {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  description: string | null;
  minOrderQty: number | null;
  orderStep: number | null;
  isAvailable: boolean;
  deletedAt: Date | null;
  supplierId: string;
  createdAt: Date;
}

export interface CreateSupplierItemData {
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  isAvailable?: boolean;
}

export interface UpdateSupplierItemData {
  name?: string;
  unit?: string;
  basePrice?: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  isAvailable?: boolean;
  deletedAt?: Date | null;
}

export interface ItemReferenceCheck {
  hasReferences: boolean;
  reasons: string[];
}

export interface SupplierRepository {
  findAll(params?: FindAllSupplierParams): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  findByNib(nib: string): Promise<Supplier | null>;
  count(params?: { search?: string }): Promise<number>;
  create(data: CreateSupplierData): Promise<Supplier>;
  update(id: string, data: UpdateSupplierData): Promise<Supplier>;
  delete(id: string): Promise<void>;
  findItems(supplierId: string): Promise<SupplierItemData[]>;
  findItemById(itemId: string): Promise<SupplierItemData | null>;
  addItem(
    supplierId: string,
    data: CreateSupplierItemData,
  ): Promise<SupplierItemData>;
  updateItem(
    itemId: string,
    data: UpdateSupplierItemData,
  ): Promise<SupplierItemData>;
  hasItemReferences(itemId: string): Promise<ItemReferenceCheck>;
  removeItem(itemId: string): Promise<void>;
}
