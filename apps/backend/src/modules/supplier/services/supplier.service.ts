import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";
import { CreateSupplierItemDto } from "../dto/create-supplier-item.dto";

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!supplier)
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.delete({ where: { id } });
  }

  async addItem(supplierId: string, dto: CreateSupplierItemDto) {
    await this.findOne(supplierId);
    return this.prisma.supplierItem.create({
      data: { ...dto, supplierId },
    });
  }

  async findItems(supplierId: string) {
    await this.findOne(supplierId);
    return this.prisma.supplierItem.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.supplierItem.delete({ where: { id: itemId } });
  }
}
