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
      include: { items: true, supplier: true, sppg: true },
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto, sppgId: string, createdById: string) {
    let total = 0;
    const itemsData = dto.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;
      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      };
    });

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
    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
