import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderStatus } from "@sigizi/shared";

const OS = OrderStatus;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OS.PENDING]: [OS.CONFIRMED],
    [OS.CONFIRMED]: [OS.DELIVERED],
    [OS.DELIVERED]: [OS.COMPLETED],
    [OS.COMPLETED]: [],
  };

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
    supplierId?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where: any = {};
    if (sppgId) where.sppgId = sppgId;
    if (supplierId) where.supplierId = supplierId;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true, supplier: true, sppg: true },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { inventoryStocks: true },
        },
        supplier: true,
        sppg: true,
      },
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto, sppgId: string, createdById: string) {
    // 1. Resolve unitPrice untuk setiap item
    //    - Jika ada mouId: ambil dari MouItem.agreedPrice
    //    - Jika tidak: ambil dari SupplierItem.basePrice
    let mouItems: Map<string, number> = new Map();

    if (dto.mouId) {
      const mouItemsData = await this.prisma.mouItem.findMany({
        where: { mouId: dto.mouId },
      });
      for (const mi of mouItemsData) {
        mouItems.set(mi.itemId, mi.agreedPrice);
      }
    }

    let total = 0;
    const itemsData: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of dto.items) {
      const unitPrice =
        mouItems.get(item.itemId) ?? (await this.getBasePrice(item.itemId));
      const subtotal = item.quantity * unitPrice;
      total += subtotal;

      itemsData.push({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    return this.prisma.order.create({
      data: {
        supplierId: dto.supplierId,
        sppgId,
        mouId: dto.mouId,
        notes: dto.notes,
        total,
        createdById,
        status: "PENDING",
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await this.findOne(id);
    const allowed = this.VALID_TRANSITIONS[order.status as OrderStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    // Ketika Order → COMPLETED: buat InventoryStock dari setiap OrderItem
    if (newStatus === OS.COMPLETED) {
      return this.prisma.$transaction(async (tx) => {
        // Update status order
        await tx.order.update({
          where: { id },
          data: { status: newStatus },
        });

        // Buat InventoryStock untuk setiap OrderItem
        for (const orderItem of order.items!) {
          await tx.inventoryStock.create({
            data: {
              sppgId: order.sppgId,
              itemId: orderItem.itemId,
              orderItemId: orderItem.id,
              purchasePrice: orderItem.unitPrice,
              initialQty: orderItem.quantity,
              remainingQty: orderItem.quantity,
            },
          });
        }

        return tx.order.findUnique({
          where: { id },
          include: { items: true },
        });
      });
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  private async getBasePrice(itemId: string): Promise<number> {
    const item = await this.prisma.supplierItem.findUnique({
      where: { id: itemId },
      select: { basePrice: true },
    });
    if (!item) {
      throw new NotFoundException(`SupplierItem with ID ${itemId} not found`);
    }
    return item.basePrice;
  }
}
