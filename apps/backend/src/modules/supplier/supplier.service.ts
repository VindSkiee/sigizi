import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupplierRequest, UpdateSupplierRequest, CreateSupplierItemRequest } from '@sigizi/shared';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, page = 1, limit = 20) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier tidak ditemukan');
    }

    return supplier;
  }

  async create(data: CreateSupplierRequest) {
    return this.prisma.supplier.create({
      data,
      include: { items: true },
    });
  }

  async update(id: string, data: UpdateSupplierRequest) {
    await this.findById(id);

    return this.prisma.supplier.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async addItem(supplierId: string, data: CreateSupplierItemRequest) {
    await this.findById(supplierId);

    return this.prisma.supplierItem.create({
      data: {
        ...data,
        supplierId,
      },
    });
  }

  async getItems(supplierId: string) {
    await this.findById(supplierId);

    return this.prisma.supplierItem.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
