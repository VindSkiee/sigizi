import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
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
import {
  MarketService,
  IntegratedValidationResult,
} from "../../market/services/market.service";

const OS = OrderStatus;

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly marketService: MarketService,
  ) {}

  private readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OS.PENDING]: [OS.CONFIRMED, OS.CANCELLED],
    [OS.CONFIRMED]: [OS.DELIVERED, OS.CANCELLED],
    [OS.DELIVERED]: [OS.COMPLETED, OS.CANCELLED],
    [OS.COMPLETED]: [OS.CANCELLED],
    [OS.CANCELLED]: [],
  };

  private readonly TRANSITION_ROLES: Record<string, Role[]> = {
    [`${OS.PENDING}→${OS.CONFIRMED}`]: [Role.SUPPLIER],
    [`${OS.CONFIRMED}→${OS.DELIVERED}`]: [Role.SUPPLIER],
    [`${OS.DELIVERED}→${OS.COMPLETED}`]: [Role.SPPG_ADMIN],
    [`${OS.PENDING}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN, Role.SUPPLIER],
    [`${OS.CONFIRMED}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN, Role.SUPPLIER],
    [`${OS.DELIVERED}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN],
    [`${OS.COMPLETED}→${OS.CANCELLED}`]: [Role.SPPG_ADMIN],
  };

  async findAll(
    pagination: PaginationDto,
    currentUser: {
      id: string;
      role: Role;
      sppgId?: string;
      supplierId?: string;
    },
    sppgId?: string,
    supplierId?: string,
    status?: OrderStatus,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where: any = {};

    // Role-based filtering: supplier hanya bisa lihat order sendiri, admin hanya bisa lihat order SPPG sendiri
    if (currentUser.role === Role.SUPPLIER) {
      if (!currentUser.supplierId) {
        throw new BadRequestException(
          "Akun Anda belum terhubung ke supplier. Silakan hubungi administrator.",
        );
      }
      where.supplierId = currentUser.supplierId;
    } else if (currentUser.role === Role.SPPG_ADMIN) {
      if (!currentUser.sppgId) {
        throw new BadRequestException(
          "Akun Anda belum terhubung ke SPPG. Silakan hubungi administrator.",
        );
      }
      where.sppgId = currentUser.sppgId;
    } else {
      // Fallback: apply explicit query params only if provided
      if (sppgId) where.sppgId = sppgId;
      if (supplierId) where.supplierId = supplierId;
    }

    if (status) where.status = status;

    const now = new Date();

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { item: true } },
          supplier: true,
          sppg: true,
        },
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
        items: { include: { item: true, inventoryStocks: true } },
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
    // ═══════════════════════════════════════════════════════════════════
    // 1. VALIDASI MoU (jika ada)
    // ═══════════════════════════════════════════════════════════════════
    let mouItems: Map<string, number> = new Map();
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

      const mouItemsData = await this.prisma.mouItem.findMany({
        where: { mouId: dto.mouId },
      });
      for (const mi of mouItemsData) {
        mouItems.set(mi.itemId, mi.agreedPrice);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. BULK FETCH — Semua data sekaligus, tanpa loop await
    // ═══════════════════════════════════════════════════════════════════
    const itemIds = dto.items.map((i) => i.itemId);

    const [supplierItems, sppg] = await Promise.all([
      this.prisma.supplierItem.findMany({
        where: {
          id: { in: itemIds },
          deletedAt: null,
          stock: { gt: 0 },
        },
        select: { id: true, basePrice: true, name: true, stock: true },
      }),
      this.prisma.sppg.findUnique({
        where: { id: sppgId },
        select: { province: true, regency: true, district: true },
      }),
    ]);

    const itemMap = new Map(supplierItems.map((i) => [i.id, i]));

    // Validasi semua item ditemukan dan tersedia
    for (const item of dto.items) {
      if (!itemMap.has(item.itemId)) {
        const raw = await this.prisma.supplierItem.findUnique({
          where: { id: item.itemId },
          select: { deletedAt: true, stock: true, name: true },
        });
        if (!raw) {
          throw new NotFoundException(
            `Barang dengan ID ${item.itemId} tidak ditemukan dalam sistem`,
          );
        }
        if (raw.deletedAt) {
          throw new BadRequestException(
            `Barang "${raw.name}" sudah tidak tersedia (dihapus)`,
          );
        }
        throw new BadRequestException(
          `Barang "${raw.name}" sedang habis (stok: ${raw.stock})`,
        );
      }
    }

    // Validasi kuantitas > 0 dan stok mencukupi
    for (const item of dto.items) {
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Kuantitas untuk item ${item.itemId} harus lebih dari 0`,
        );
      }
      const supplierItem = itemMap.get(item.itemId)!;
      if (item.quantity > supplierItem.stock) {
        throw new BadRequestException({
          message: `Stok "${supplierItem.name}" tidak mencukupi`,
          details: {
            itemId: item.itemId,
            itemName: supplierItem.name,
            requested: item.quantity,
            available: supplierItem.stock,
          },
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. BANGUN FILTER untuk validasi harga
    //    Prioritaskan marketFilter dari request (scope pasar yg dilihat admin),
    //    fallback ke lokasi SPPG bila tidak disertakan.
    // ═══════════════════════════════════════════════════════════════════
    const mf = dto.marketFilter;
    const hasClientFilter =
      !!mf &&
      (mf.province !== undefined ||
        mf.regency !== undefined ||
        mf.district !== undefined ||
        mf.marketName !== undefined ||
        mf.latitude !== undefined ||
        mf.longitude !== undefined);
    const marketFilter = hasClientFilter
      ? (mf as {
          province?: string;
          regency?: string;
          district?: string;
          marketName?: string;
          latitude?: number;
          longitude?: number;
          radiusKm?: number;
        })
      : {
          province: sppg?.province ?? undefined,
          regency: sppg?.regency ?? undefined,
          district: sppg?.district ?? undefined,
        };

    // ═══════════════════════════════════════════════════════════════════
    // 4. VALIDASI HARGA — Parallel execution via Promise.all
    // ═══════════════════════════════════════════════════════════════════
    const validationResults = await Promise.all(
      dto.items.map(async (item) => {
        const supplierItem = itemMap.get(item.itemId)!;
        const unitPrice = mouItems.get(item.itemId) ?? supplierItem.basePrice;
        const itemName = supplierItem.name;

        const validation = await this.marketService.validatePrice(
          itemName,
          unitPrice,
          marketFilter,
        );

        return {
          itemId: item.itemId,
          itemName,
          unitPrice,
          validation,
        };
      }),
    );

    // ═══════════════════════════════════════════════════════════════════
    // 5. CEK HASIL VALIDASI
    // ═══════════════════════════════════════════════════════════════════
    const invalidItems = validationResults.filter(
      (r) => r.validation.status === "INVALID",
    );
    if (invalidItems.length > 0) {
      throw new BadRequestException({
        message:
          "Beberapa item memiliki harga tidak valid berdasarkan data pasar",
        details: invalidItems.map((i) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          unitPrice: i.unitPrice,
          ...i.validation,
        })),
      });
    }

    const warningItems = validationResults.filter(
      (r) => r.validation.status === "WARNING",
    );
    if (warningItems.length > 0 && !dto.priceJustification) {
      throw new BadRequestException({
        message:
          "Beberapa item memiliki harga di atas normal. Sertakan priceJustification di request body",
        details: warningItems.map((i) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          unitPrice: i.unitPrice,
          ...i.validation,
        })),
      });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 6. HITUNG TOTAL + BUILD SNAPSHOT MAP
    // ═══════════════════════════════════════════════════════════════════
    const validationMap = new Map(validationResults.map((r) => [r.itemId, r]));

    let total = 0;
    const itemsData: {
      itemId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      marketMedianAtPurchase: number | null;
      isWarningBypass: boolean;
      justificationNote: string | null;
    }[] = [];

    for (const item of dto.items) {
      const supplierItem = itemMap.get(item.itemId)!;
      const unitPrice = mouItems.get(item.itemId) ?? supplierItem.basePrice;
      const subtotal = item.quantity * unitPrice;
      total += subtotal;

      const vr = validationMap.get(item.itemId);
      const isWarningBypass = vr?.validation.status === "WARNING";
      const justificationNote = isWarningBypass
        ? `[Price Validation Justification] ${dto.priceJustification}`
        : "Semua harga valid sesuai data pasar";

      itemsData.push({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        marketMedianAtPurchase: vr?.validation.marketMedianSnapshot ?? null,
        isWarningBypass,
        justificationNote,
      });
    }

    // ═══════════════════════════════════════════════════════════════════
    // 7. BUILD AUDIT TRAIL NOTES
    // ═══════════════════════════════════════════════════════════════════
    const justificationNotes =
      warningItems.length > 0
        ? `[Price Validation Justification] ${dto.priceJustification}`
        : "Semua harga valid sesuai data pasar";

    // ═══════════════════════════════════════════════════════════════════
    // 8. CREATE ORDER + AUDIT TRAIL
    // ═══════════════════════════════════════════════════════════════════
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
          items: {
            create: itemsData.map((i) => ({
              itemId: i.itemId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
              marketMedianAtPurchase: i.marketMedianAtPurchase,
              isWarningBypass: i.isWarningBypass,
              justificationNote: i.justificationNote,
            })),
          },
        },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: OS.PENDING,
          changedById: createdById,
          notes: justificationNotes,
        },
      });

      // Atomic stock decrement dengan concurrency guard
      for (const item of dto.items) {
        const result = await tx.supplierItem.updateMany({
          where: {
            id: item.itemId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            stockUpdatedAt: new Date(),
          },
        });
        if (result.count === 0) {
          throw new BadRequestException(
            `Stok "${item.itemId}" tidak mencukupi atau berubah saat proses pemesanan. Silakan coba lagi.`,
          );
        }
      }

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

    if (newStatus === OS.CANCELLED && currentStatus === OS.COMPLETED) {
      await this.validateStockRollback(id);
    }

    if (newStatus === OS.COMPLETED && currentStatus === OS.DELIVERED) {
      if (!order.paidAt) {
        throw new BadRequestException(
          "Order belum dibayar. Konfirmasi pembayaran terlebih dahulu melalui endpoint payment sebelum menyelesaikan order.",
        );
      }
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
        // Payment already confirmed via confirmPayment endpoint
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
          evidenceUrl: dto.deliveryEvidence,
        },
      });

      if (newStatus === OS.CANCELLED) {
        await this.restoreStockForOrder(tx, id);
      }

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

  async confirmPayment(orderId: string, userId: string) {
    const order = await this.findOne(orderId);

    if (order.status !== OS.DELIVERED) {
      throw new BadRequestException(
        `Hanya order dengan status DELIVERED yang dapat ditandai sebagai sudah dibayar. Status saat ini: "${order.status}"`,
      );
    }

    const currentStatus = order.status as OrderStatus;

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          paidAt: new Date(),
          paidById: userId,
          updatedById: userId,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          fromStatus: currentStatus,
          toStatus: currentStatus,
          changedById: userId,
          notes: "Pembayaran dikonfirmasi oleh SPPG",
        },
      });

      return result;
    });

    return updatedOrder;
  }

  // ═══════════════════════════════════════════════════════════════════
  // TRANSACTION HISTORY
  // ═══════════════════════════════════════════════════════════════════

  async findTransactions(
    sppgId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: OrderStatus;
    },
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Build date range: default to today, use half-open [start, end)
    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    const startDateStr = query.startDate ?? todayStr;
    const endDateStr = query.endDate ?? todayStr;

    const start = this.parseDateOnly(startDateStr);
    const endExclusive = this.parseDateOnly(endDateStr);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    if (start >= endExclusive) {
      throw new BadRequestException("startDate harus lebih kecil dari endDate");
    }

    const where: any = {
      sppgId,
      createdAt: { gte: start, lt: endExclusive },
    };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          status: true,
          total: true,
          paidAt: true,
          supplier: { select: { id: true, name: true } },
          items: { select: { id: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        total: o.total,
        supplier: o.supplier,
        itemCount: o.items.length,
        paidAt: o.paidAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTransactionDetail(id: string, sppgId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, sppgId },
      select: {
        id: true,
        status: true,
        total: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true,
        cancelledAt: true,
        cancelledReason: true,
        expectedDeliveryDate: true,
        actualDeliveryDate: true,
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            profileImage: true,
          },
        },
        sppg: { select: { id: true, name: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            marketMedianAtPurchase: true,
            isWarningBypass: true,
            justificationNote: true,
            item: { select: { id: true, name: true, unit: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Transaksi dengan ID ${id} tidak ditemukan atau tidak termasuk dalam cakupan SPPG Anda`,
      );
    }

    return order;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUPPLIER TRANSACTION HISTORY
  // ═══════════════════════════════════════════════════════════════════

  async findSupplierTransactions(
    supplierId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: OrderStatus;
    },
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    const startDateStr = query.startDate ?? todayStr;
    const endDateStr = query.endDate ?? todayStr;

    const start = this.parseDateOnly(startDateStr);
    const endExclusive = this.parseDateOnly(endDateStr);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    if (start >= endExclusive) {
      throw new BadRequestException("startDate harus lebih kecil dari endDate");
    }

    const where: any = {
      supplierId,
      createdAt: { gte: start, lt: endExclusive },
    };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          status: true,
          total: true,
          paidAt: true,
          sppg: { select: { id: true, name: true } },
          items: { select: { id: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        total: o.total,
        sppg: o.sppg,
        itemCount: o.items.length,
        paidAt: o.paidAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findSupplierTransactionDetail(id: string, supplierId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, supplierId },
      select: {
        id: true,
        status: true,
        total: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true,
        cancelledAt: true,
        cancelledReason: true,
        expectedDeliveryDate: true,
        actualDeliveryDate: true,
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            profileImage: true,
          },
        },
        sppg: { select: { id: true, name: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            marketMedianAtPurchase: true,
            isWarningBypass: true,
            justificationNote: true,
            item: { select: { id: true, name: true, unit: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Transaksi dengan ID ${id} tidak ditemukan atau tidak termasuk dalam cakupan Supplier Anda`,
      );
    }

    return order;
  }

  private parseDateOnly(date: string): Date {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Tanggal tidak valid: ${date}`);
    }
    return parsed;
  }

  private async restoreStockForOrder(tx: TxClient, orderId: string) {
    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
      select: { itemId: true, quantity: true },
    });

    for (const item of orderItems) {
      await tx.supplierItem.update({
        where: { id: item.itemId },
        data: {
          stock: { increment: item.quantity },
          stockUpdatedAt: new Date(),
        },
      });
    }
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
}
