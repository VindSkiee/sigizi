import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service";
import {
  SupplierRepository,
  FindAllSupplierParams,
  CreateSupplierData,
  UpdateSupplierData,
  CreateSupplierItemData,
  UpdateSupplierItemData,
  SupplierItemData,
  ItemReferenceCheck,
} from "../../domain";
import { Supplier } from "../../domain";

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllSupplierParams = {}): Promise<Supplier[]> {
    const { skip = 0, take = 20, search } = params;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nib: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { regency: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await this.prisma.supplier.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return items.map((item) => this.toDomain(item));
  }

  async findById(id: string): Promise<Supplier | null> {
    const item = await this.prisma.supplier.findUnique({
      where: { id },
      include: { items: true },
    });
    return item ? this.toDomain(item) : null;
  }

  async findByNib(nib: string): Promise<Supplier | null> {
    const item = await this.prisma.supplier.findUnique({
      where: { nib },
      include: { items: true },
    });
    return item ? this.toDomain(item) : null;
  }

  async count(params: { search?: string } = {}): Promise<number> {
    const { search } = params;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nib: { contains: search, mode: "insensitive" } },
      ];
    }
    return this.prisma.supplier.count({ where });
  }

  async create(data: CreateSupplierData): Promise<Supplier> {
    const item = await this.prisma.supplier.create({
      data: {
        name: data.name,
        nib: data.nib,
        phone: data.phone,
        address: data.address,
        province: data.province,
        regency: data.regency,
        district: data.district,
        village: data.village,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: { items: true },
    });
    return this.toDomain(item);
  }

  async update(id: string, data: UpdateSupplierData): Promise<Supplier> {
    const item = await this.prisma.supplier.update({
      where: { id },
      data,
      include: { items: true },
    });
    return this.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplierItem.deleteMany({ where: { supplierId: id } });
    await this.prisma.supplier.delete({ where: { id } });
  }

  async findItems(supplierId: string): Promise<SupplierItemData[]> {
    const items = await this.prisma.supplierItem.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      basePrice: item.basePrice,
      description: item.description,
      minOrderQty: item.minOrderQty,
      orderStep: item.orderStep,
      isAvailable: item.isAvailable,
      supplierId: item.supplierId,
      createdAt: item.createdAt,
    }));
  }

  async findItemById(itemId: string): Promise<SupplierItemData | null> {
    const item = await this.prisma.supplierItem.findUnique({
      where: { id: itemId },
    });
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      basePrice: item.basePrice,
      description: item.description,
      minOrderQty: item.minOrderQty,
      orderStep: item.orderStep,
      isAvailable: item.isAvailable,
      supplierId: item.supplierId,
      createdAt: item.createdAt,
    };
  }

  async addItem(
    supplierId: string,
    data: CreateSupplierItemData,
  ): Promise<SupplierItemData> {
    const item = await this.prisma.supplierItem.create({
      data: {
        name: data.name,
        unit: data.unit,
        basePrice: data.basePrice,
        description: data.description,
        minOrderQty: data.minOrderQty,
        orderStep: data.orderStep,
        isAvailable: data.isAvailable ?? true,
        supplierId,
      },
    });
    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      basePrice: item.basePrice,
      description: item.description,
      minOrderQty: item.minOrderQty,
      orderStep: item.orderStep,
      isAvailable: item.isAvailable,
      supplierId: item.supplierId,
      createdAt: item.createdAt,
    };
  }

  async updateItem(
    itemId: string,
    data: UpdateSupplierItemData,
  ): Promise<SupplierItemData> {
    const item = await this.prisma.supplierItem.update({
      where: { id: itemId },
      data,
    });
    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      basePrice: item.basePrice,
      description: item.description,
      minOrderQty: item.minOrderQty,
      orderStep: item.orderStep,
      isAvailable: item.isAvailable,
      supplierId: item.supplierId,
      createdAt: item.createdAt,
    };
  }

  async hasItemReferences(itemId: string): Promise<ItemReferenceCheck> {
    const reasons: string[] = [];

    const [mouItems, orderItems, batchItems, inventoryStocks] =
      await Promise.all([
        this.prisma.mouItem.count({ where: { itemId } }),
        this.prisma.orderItem.count({ where: { itemId } }),
        this.prisma.batchItem.count({ where: { itemId } }),
        this.prisma.inventoryStock.count({ where: { itemId } }),
      ]);

    if (mouItems > 0) reasons.push(`${mouItems} MoU aktif`);
    if (orderItems > 0) reasons.push(`${orderItems} order tercatat`);
    if (batchItems > 0) reasons.push(`${batchItems} batch produksi`);
    if (inventoryStocks > 0) reasons.push(`${inventoryStocks} stok inventory`);

    return { hasReferences: reasons.length > 0, reasons };
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.supplierItem.delete({ where: { id: itemId } });
  }

  private toDomain(prismaItem: any): Supplier {
    return new Supplier(
      prismaItem.id,
      prismaItem.name,
      prismaItem.nib,
      prismaItem.phone,
      prismaItem.address,
      prismaItem.province,
      prismaItem.regency,
      prismaItem.district,
      prismaItem.village,
      prismaItem.postalCode,
      prismaItem.latitude,
      prismaItem.longitude,
      prismaItem.createdAt,
      prismaItem.updatedAt,
    );
  }
}
