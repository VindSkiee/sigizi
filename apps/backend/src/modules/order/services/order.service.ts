import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto";
import { OrderStatus, Role } from "@sigizi/shared";
import {
  OrderCompletedEvent,
  OrderCancelledEvent,
} from "../events/order.events";

const OS = OrderStatus;

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OS.PENDING]: [OS.CONFIRMED, OS.CANCELLED],
    [OS.CONFIRMED]: [OS.DELIVERED, OS.CANCELLED],
    [OS.DELIVERED]: [OS.COMPLETED, OS.CANCELLED],
    [OS.COMPLETED]: [],
    [OS.CANCELLED]: [],
  };

  private readonly TRANSITION_ROLES: Record<string, Role[]> = {
    [`${OS.PENDING}→${OS.CONFIRMED}`]: [Role.SUPPLIER],
    [`${OS.CONFIRMED}→${OS.DELIVERED}`]: [Role.SUPPLIER],
    [`${OS.DELIVERED}→${OS.COMPLETED}`]: [Role.SPPG_ADMIN],
    [`${OS.PENDING}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN, Role.SUPPLIER],
    [`${OS.CONFIRMED}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN, Role.SUPPLIER],
    [`${OS.DELIVERED}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN],
  };

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
    supplierId?: string,
    status?: OrderStatus,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where: any = {};
    if (sppgId) where.sppgId = sppgId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const now = new Date();

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

    const itemsWithLateFlag = items.map((item) => ({
      ...item,
      isLate:
        item.expectedDeliveryDate &&
        item.status !== OS.COMPLETED &&
        item.status !== OS.CANCELLED &&
        now > new Date(item.expectedDeliveryDate),
    }));

    return {
      items: itemsWithLateFlag,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { inventoryStocks: true } },
        supplier: true,
        sppg: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order)
      throw new NotFoundException(
        `Order dengan ID ${id} tidak ditemukan di dalam sistem`,
      );

    const now = new Date();
    const isLate =
      order.expectedDeliveryDate &&
      order.status !== OS.COMPLETED &&
      order.status !== OS.CANCELLED &&
      now > new Date(order.expectedDeliveryDate);

    return { ...order, isLate };
  }

  async create(dto: CreateOrderDto, sppgId: string, createdById: string) {
    if (dto.mouId) {
      const mou = await this.prisma.mou.findUnique({
        where: { id: dto.mouId },
      });
      if (!mou)
        throw new NotFoundException(
          `MoU dengan ID ${dto.mouId} tidak ditemukan`,
        );
      if (mou.status !== "ACTIVE") {
        throw new BadRequestException(
          `MoU ${dto.mouId} tidak dapat digunakan karena statusnya "${mou.status}" (diperlukan status ACTIVE)`,
        );
      }
      if (mou.sppgId !== sppgId) {
        throw new BadRequestException(
          `MoU ${dto.mouId} tidak termasuk dalam cakupan SPPG Anda`,
        );
      }
    }

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

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          supplierId: dto.supplierId,
          sppgId,
          mouId: dto.mouId,
          notes: dto.notes,
          total,
          createdById,
          status: OS.PENDING,
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: OS.PENDING,
          changedById: createdById,
          notes: "Order berhasil dibuat dan menunggu konfirmasi dari supplier",
        },
      });

      return newOrder;
    });

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    currentUser: {
      id: string;
      role: Role;
      sppgId?: string;
      supplierId?: string;
    },
  ) {
    const order = await this.findOne(id);
    const currentStatus = order.status as OrderStatus;
    const newStatus = dto.status;

    const allowed = this.VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transisi status dari "${currentStatus}" ke "${newStatus}" tidak diperbolehkan`,
      );
    }

    const transitionKey = `${currentStatus}→${newStatus}`;
    const allowedRoles = this.TRANSITION_ROLES[transitionKey] ?? [];
    if (!allowedRoles.includes(currentUser.role)) {
      throw new BadRequestException(
        `Anda tidak memiliki hak akses untuk mengubah status dari "${currentStatus}" ke "${newStatus}"`,
      );
    }

    if (
      currentUser.role === Role.SUPPLIER &&
      order.supplierId !== currentUser.supplierId
    ) {
      throw new BadRequestException(
        "Anda tidak memiliki akses untuk mengubah status order ini karena order ini bukan milik Anda",
      );
    }

    if (newStatus === OS.CANCELLED && !dto.reason) {
      throw new BadRequestException(
        "Alasan pembatalan wajib diisi saat membatalkan order",
      );
    }

    if (newStatus === OS.COMPLETED && !dto.paymentEvidenceUrl) {
      throw new BadRequestException(
        "Bukti pembayaran wajib diunggah saat menyelesaikan order",
      );
    }

    if (newStatus === OS.CANCELLED && currentStatus === OS.COMPLETED) {
      await this.validateStockRollback(id);
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: newStatus,
        updatedById: currentUser.id,
      };

      if (newStatus === OS.DELIVERED) {
        updateData.actualDeliveryDate = new Date();
        updateData.deliveryEvidence = dto.deliveryEvidence;
      } else if (newStatus === OS.COMPLETED) {
        updateData.paidAt = new Date();
        updateData.paidById = currentUser.id;
        updateData.paymentEvidenceUrl = dto.paymentEvidenceUrl;
      } else if (newStatus === OS.CANCELLED) {
        updateData.cancelledAt = new Date();
        updateData.cancelledReason = dto.reason;
        updateData.cancelledById = currentUser.id;
      }

      const result = await tx.order.update({
        where: { id },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: currentStatus,
          toStatus: newStatus,
          changedById: currentUser.id,
          notes: dto.notes,
          evidenceUrl: dto.deliveryEvidence || dto.paymentEvidenceUrl,
        },
      });

      return result;
    });

    if (newStatus === OS.COMPLETED) {
      const event = new OrderCompletedEvent(
        id,
        order.sppgId,
        order.items!.map((item: any) => ({
          orderItemId: item.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        currentUser.id,
      );
      this.eventEmitter.emit("order.completed", event);
    } else if (newStatus === OS.CANCELLED) {
      const event = new OrderCancelledEvent(
        id,
        order.sppgId,
        currentStatus,
        currentUser.id,
        dto.reason!,
      );
      this.eventEmitter.emit("order.cancelled", event);
    }

    return updatedOrder;
  }

  private async validateStockRollback(orderId: string) {
    const stocks = await this.prisma.inventoryStock.findMany({
      where: {
        orderItem: { orderId },
      },
    });

    for (const stock of stocks) {
      if (stock.remainingQty < stock.initialQty) {
        throw new BadRequestException(
          `Tidak dapat membatalkan order karena stok barang dengan ID ${stock.itemId} sudah terpakai ` +
            `(tersisa ${stock.remainingQty} dari ${stock.initialQty} unit). ` +
            `Silakan hubungi administrator untuk proses retur secara manual.`,
        );
      }
    }
  }

  private async getBasePrice(itemId: string): Promise<number> {
    const item = await this.prisma.supplierItem.findUnique({
      where: { id: itemId },
      select: { basePrice: true },
    });
    if (!item)
      throw new NotFoundException(
        `Barang dengan ID ${itemId} tidak ditemukan dalam katalog supplier`,
      );
    return item.basePrice;
  }
}
