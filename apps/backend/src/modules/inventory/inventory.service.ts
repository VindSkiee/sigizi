import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateManualStockDto } from "./dto/create-manual-stock.dto";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { StockQueryDto } from "./dto/stock-query.dto";
import { StockSource, Role } from "@sigizi/shared";
import { PaginationDto, PaginatedResult } from "../../core/dto/pagination.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Input stok manual (MANUAL_ADJUSTMENT).
   * Hanya bisa diakses oleh SPPG_ADMIN.
   */
  async createManualStock(
    dto: CreateManualStockDto,
    sppgId: string,
    userId: string,
  ) {
    // Validasi item exists
    const item = await this.prisma.supplierItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item) {
      throw new NotFoundException(
        `Barang dengan ID ${dto.itemId} tidak ditemukan`,
      );
    }

    // Buat lot stok baru
    const stock = await this.prisma.inventoryStock.create({
      data: {
        sppgId,
        itemId: dto.itemId,
        source: StockSource.MANUAL_ADJUSTMENT,
        purchasePrice: dto.purchasePrice,
        initialQty: dto.quantity,
        remainingQty: dto.quantity,
        expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
        createdById: userId,
        notes: dto.notes,
      },
      include: {
        item: { select: { name: true, unit: true } },
        createdBy: { select: { name: true } },
      },
    });

    return stock;
  }

  /**
   * Penyesuaian stok pada lot tertentu.
   * adjustmentQty: negatif untuk pengurangan, positif untuk penambahan.
   * Mencatat audit trail di InventoryAdjustmentLog.
   */
  async adjustStockLot(stockId: string, dto: AdjustStockDto, userId: string) {
    // Cari lot stok
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { id: stockId },
    });
    if (!stock) {
      throw new NotFoundException(
        `Lot stok dengan ID ${stockId} tidak ditemukan`,
      );
    }

    // Hitung remainingQty baru
    const newRemainingQty = stock.remainingQty + dto.adjustmentQty;

    // Validasi: tidak boleh minus
    if (newRemainingQty < 0) {
      throw new BadRequestException(
        `Tidak dapat melakukan penyesuaian: stok akan menjadi negatif (${newRemainingQty}). ` +
          `Stok saat ini: ${stock.remainingQty}, penyesuaian: ${dto.adjustmentQty}`,
      );
    }

    // Update stok dan buat log dalam transaksi
    const [updatedStock, adjustmentLog] = await this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.inventoryStock.update({
          where: { id: stockId },
          data: { remainingQty: newRemainingQty },
        });

        const log = await tx.inventoryAdjustmentLog.create({
          data: {
            inventoryStockId: stockId,
            adjustmentQty: dto.adjustmentQty,
            reason: dto.reason,
            description: dto.description,
            changedById: userId,
          },
        });

        return [updated, log];
      },
    );

    return {
      stock: updatedStock,
      adjustment: adjustmentLog,
    };
  }

  /**
   * List semua lot stok dengan filter.
   */
  async findAll(
    sppgId: string,
    pagination: PaginationDto,
    query: StockQueryDto,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const where: any = { sppgId };

    if (query.itemId) {
      where.itemId = query.itemId;
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.minRemaining !== undefined) {
      where.remainingQty = { gte: query.minRemaining };
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryStock.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          item: { select: { id: true, name: true, unit: true } },
          createdBy: { select: { id: true, name: true } },
          adjustments: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { changedBy: { select: { name: true } } },
          },
        },
      }),
      this.prisma.inventoryStock.count({ where }),
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

  /**
   * Real-time Balance: Agregasi total remainingQty per item.
   */
  async getStockBalance(sppgId: string, itemId?: string) {
    const where: any = {
      sppgId,
      remainingQty: { gt: 0 },
    };

    if (itemId) {
      where.itemId = itemId;
    }

    const balance = await this.prisma.inventoryStock.groupBy({
      by: ["itemId"],
      where,
      _sum: {
        remainingQty: true,
        initialQty: true,
      },
      _count: {
        id: true,
      },
    });

    // Ambil detail item
    const itemIds = balance.map((b) => b.itemId);
    const items = await this.prisma.supplierItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, unit: true, minThreshold: true },
    });

    const itemMap = new Map(items.map((i) => [i.id, i]));

    return balance.map((b) => ({
      item: itemMap.get(b.itemId),
      totalRemaining: b._sum.remainingQty,
      totalInitial: b._sum.initialQty,
      lotCount: b._count.id,
    }));
  }

  /**
   * Stock Valuation: Hitung total nilai stok (remainingQty × purchasePrice).
   */
  async getStockValuation(sppgId: string) {
    const stocks = await this.prisma.inventoryStock.findMany({
      where: {
        sppgId,
        remainingQty: { gt: 0 },
      },
      include: {
        item: { select: { id: true, name: true, unit: true } },
      },
    });

    let totalValue = 0;
    const itemValuations = new Map<
      string,
      {
        itemId: string;
        itemName: string;
        unit: string;
        totalQty: number;
        totalValue: number;
      }
    >();

    for (const stock of stocks) {
      const stockValue = stock.remainingQty * stock.purchasePrice;
      totalValue += stockValue;

      const existing = itemValuations.get(stock.itemId);
      if (existing) {
        existing.totalQty += stock.remainingQty;
        existing.totalValue += stockValue;
      } else {
        itemValuations.set(stock.itemId, {
          itemId: stock.itemId,
          itemName: stock.item.name,
          unit: stock.item.unit,
          totalQty: stock.remainingQty,
          totalValue: stockValue,
        });
      }
    }

    return {
      totalValue,
      items: Array.from(itemValuations.values()),
    };
  }

  /**
   * Low Stock Alert: Item yang totalRemaining < minThreshold.
   */
  async getLowStockAlerts(sppgId: string, defaultThreshold: number = 10) {
    // Ambil balance per item
    const balance = await this.getStockBalance(sppgId);

    const alerts = balance
      .filter((b) => {
        const threshold = b.item?.minThreshold ?? defaultThreshold;
        return (b.totalRemaining ?? 0) < threshold;
      })
      .map((b) => ({
        ...b,
        threshold: b.item?.minThreshold ?? defaultThreshold,
        isLow: true,
      }));

    return alerts;
  }

  /**
   * Riwayat penyesuaian stok untuk lot tertentu.
   */
  async getStockAdjustmentHistory(stockId: string) {
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { id: stockId },
      include: {
        item: { select: { name: true, unit: true } },
      },
    });

    if (!stock) {
      throw new NotFoundException(
        `Lot stok dengan ID ${stockId} tidak ditemukan`,
      );
    }

    const adjustments = await this.prisma.inventoryAdjustmentLog.findMany({
      where: { inventoryStockId: stockId },
      orderBy: { createdAt: "desc" },
      include: {
        changedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      stock,
      adjustments,
    };
  }

  /**
   * Find oldest lot with remainingQty > 0 for FIFO consumption.
   * Digunakan oleh BatchService untuk konsumsi stok.
   */
  async findOldestAvailableLot(sppgId: string, itemId: string) {
    return this.prisma.inventoryStock.findFirst({
      where: {
        sppgId,
        itemId,
        remainingQty: { gt: 0 },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Decrease remainingQty of a lot.
   * Digunakan oleh BatchService untuk konsumsi stok.
   */
  async decreaseStockQty(stockId: string, quantity: number) {
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new NotFoundException(
        `Lot stok dengan ID ${stockId} tidak ditemukan`,
      );
    }

    if (stock.remainingQty < quantity) {
      throw new BadRequestException(
        `Stok tidak mencukupi: tersisa ${stock.remainingQty}, diminta ${quantity}`,
      );
    }

    return this.prisma.inventoryStock.update({
      where: { id: stockId },
      data: { remainingQty: { decrement: quantity } },
    });
  }
}
