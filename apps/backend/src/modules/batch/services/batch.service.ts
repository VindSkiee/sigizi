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
        batchItems: { include: { item: { include: { supplier: true } } } },
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
        batchItems: { include: { item: true } },
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
        batchItems: { include: { item: true } },
        sppg: true,
      },
    });
    if (!batch)
      throw new NotFoundException(
        `Batch with report key ${reportKey} not found`,
      );
    return batch;
  }

  async create(dto: CreateBatchDto, sppgId: string, createdById: string) {
    let totalCost = 0;
    const itemsData = dto.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      totalCost += subtotal;
      return {
        item: { connect: { id: item.itemId } },
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
        createdBy: { connect: { id: createdById } },
      };
    });

    const beneficiaryCount = dto.beneficiaryCount ?? 1;
    const costPerPortion = totalCost / beneficiaryCount;
    const totalBudget = COST_PER_PORTION_STANDARD * beneficiaryCount;
    const budgetVariance = totalCost - totalBudget;

    const batchNumber = await this.generateBatchNumber();

    return this.prisma.batch.create({
      data: {
        batchNumber,
        reportKey: this.generateReportKey(),
        menu: dto.menu,
        nutrition: dto.nutrition as any,
        allergens: dto.allergens ?? [],
        beneficiaryCount,
        costPerPortion,
        totalCost,
        costPerPortionStandard: COST_PER_PORTION_STANDARD,
        totalBudget,
        budgetVariance,
        sppgId,
        status: BS.ACTIVE,
        createdById,
        batchItems: { create: itemsData },
      },
      include: { batchItems: true },
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

  private async generateBatchNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.prisma.batch.count({
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
