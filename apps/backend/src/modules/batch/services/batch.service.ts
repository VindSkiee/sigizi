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
import { CreateBatchDto } from "../dto/create-batch.dto";
import { UpdateBatchStatusDto } from "../dto/update-batch-status.dto";
import { BatchStatus, COST_PER_PORTION_STANDARD } from "@sigizi/shared";
import { InsufficientStockException } from "../../../common/exceptions/insufficient-stock.exception";

const BS = BatchStatus;

@Injectable()
export class BatchService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly VALID_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
    [BS.ACTIVE]: [BS.COMPLETED, BS.CANCELLED, BS.FAILED],
    [BS.COMPLETED]: [],
    [BS.CANCELLED]: [],
    [BS.FAILED]: [],
  };

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
    status?: BatchStatus,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where: any = {};
    if (sppgId) where.sppgId = sppgId;
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { date: "desc" },
        include: { batchItems: true, sppg: true },
      }),
      this.prisma.batch.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        batchItems: {
          include: {
            item: { include: { supplier: true } },
            inventoryStock: true,
          },
        },
        sppg: true,
        complaints: true,
      },
    });
    if (!batch) throw new NotFoundException(`Batch with ID ${id} not found`);
    return batch;
  }

  async findByBatchNumber(batchNumber: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { batchNumber },
      include: {
        batchItems: { include: { item: true, inventoryStock: true } },
        sppg: true,
      },
    });
    if (!batch) throw new NotFoundException(`Batch ${batchNumber} not found`);
    return batch;
  }

  async findByReportKey(reportKey: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { reportKey },
      include: {
        batchItems: { include: { item: true, inventoryStock: true } },
        sppg: true,
      },
    });
    if (!batch)
      throw new NotFoundException(
        `Batch with report key ${reportKey} not found`,
      );
    return batch;
  }

  /**
   * Create batch dengan FIFO inventory consumption.
   * Setiap BatchItem unitPrice dikunci dari InventoryStock.purchasePrice.
   * Jika satu item batch memotong 2 lot berbeda, dibuat 2 BatchItem terpisah.
   */
  async create(dto: CreateBatchDto, sppgId: string, createdById: string) {
    return this.prisma.$transaction(async (tx) => {
      let totalCost = 0;
      const batchItemsData: {
        itemId: string;
        inventoryStockId: string;
        name?: string;
        unit?: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
        createdById: string;
      }[] = [];

      for (const request of dto.items) {
        // 1. Cari InventoryStock: FIFO (createdAt ASC) dengan remainingQty > 0
        const lots = await tx.inventoryStock.findMany({
          where: {
            sppgId,
            itemId: request.itemId,
            remainingQty: { gt: 0 },
          },
          orderBy: { createdAt: "asc" },
        });

        // 2. Validasi stok mencukupi
        const totalAvailable = lots.reduce(
          (sum, lot) => sum + lot.remainingQty,
          0,
        );
        if (totalAvailable < request.quantity) {
          const item = await tx.supplierItem.findUnique({
            where: { id: request.itemId },
            select: { name: true },
          });
          throw new InsufficientStockException(
            item?.name ?? request.itemId,
            request.quantity,
            totalAvailable,
          );
        }

        // 3. FIFO: Kurangi dari lot tertua
        let quantityNeeded = request.quantity;

        for (const lot of lots) {
          if (quantityNeeded <= 0) break;

          const consumeQty = Math.min(lot.remainingQty, quantityNeeded);
          const unitPrice = lot.purchasePrice; // LOCK harga dari lot
          const subtotal = consumeQty * unitPrice;

          // Kurangi remainingQty lot
          await tx.inventoryStock.update({
            where: { id: lot.id },
            data: { remainingQty: { decrement: consumeQty } },
          });

          // Buat BatchItem
          batchItemsData.push({
            itemId: request.itemId,
            inventoryStockId: lot.id,
            name: request.name,
            unit: request.unit,
            quantity: consumeQty,
            unitPrice,
            subtotal,
            createdById,
          });

          totalCost += subtotal;
          quantityNeeded -= consumeQty;
        }
      }

      // 4. Hitung budget
      const beneficiaryCount = dto.beneficiaryCount ?? 1;
      const costPerPortion = totalCost / beneficiaryCount;
      const totalBudget = COST_PER_PORTION_STANDARD * beneficiaryCount;
      const budgetVariance = totalCost - totalBudget;

      // 5. Generate batch number (dalam transaction)
      const batchNumber = await this.generateBatchNumber(tx);

      // 6. Buat Batch + BatchItems
      const batch = await tx.batch.create({
        data: {
          batchNumber,
          reportKey: this.generateReportKey(),
          menu: dto.menu,
          nutrition: dto.nutrition as any,
          allergens: dto.allergens ?? [],
          beneficiaryCount,
          beneficiaryNames: dto.beneficiaryNames ?? [],
          costPerPortion,
          totalCost,
          costPerPortionStandard: COST_PER_PORTION_STANDARD,
          totalBudget,
          budgetVariance,
          sppgId,
          status: BS.ACTIVE,
          createdById,
          batchItems: {
            create: batchItemsData.map((bi) => ({
              itemId: bi.itemId,
              inventoryStockId: bi.inventoryStockId,
              name: bi.name,
              unit: bi.unit,
              quantity: bi.quantity,
              unitPrice: bi.unitPrice,
              subtotal: bi.subtotal,
              createdById: bi.createdById,
            })),
          },
        },
        include: {
          batchItems: { include: { inventoryStock: true, item: true } },
        },
      });

      return batch;
    });
  }

  async updateStatus(id: string, dto: UpdateBatchStatusDto) {
    const batch = await this.findOne(id);
    const allowed = this.VALID_TRANSITIONS[batch.status as BatchStatus] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${batch.status} to ${dto.status}`,
      );
    }

    if (dto.status === BS.FAILED) {
      if (!dto.failedReason) {
        throw new BadRequestException(
          "failedReason is required when marking batch as FAILED",
        );
      }
      if (!dto.failedEvidence) {
        throw new BadRequestException(
          "failedEvidence is required when marking batch as FAILED",
        );
      }
    }

    const updateData: any = { status: dto.status };

    if (dto.status === BS.FAILED) {
      updateData.failedReason = dto.failedReason;
      updateData.failedEvidence = dto.failedEvidence;
      updateData.failedAt = new Date();
    }

    return this.prisma.batch.update({
      where: { id },
      data: updateData,
    });
  }

  private async generateBatchNumber(tx: {
    batch: { count: (args: any) => Promise<number> };
  }): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await tx.batch.count({
      where: {
        createdAt: {
          gte: new Date(today.toISOString().slice(0, 10)),
        },
      },
    });
    return `BATCH-${dateStr}-${String(count + 1).padStart(3, "0")}`;
  }

  private generateReportKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let key = "";
    for (let i = 0; i < 8; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}
