import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateBatchRequest } from "@sigizi/shared";
import { randomBytes } from "crypto";

@Injectable()
export class BatchService {
  constructor(private prisma: PrismaService) {}

  async findAll(sppgId?: string, date?: string, status?: string) {
    const where: any = {};

    if (sppgId) where.sppgId = sppgId;
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    return this.prisma.batch.findMany({
      where,
      include: { sppg: true, complaints: true },
      orderBy: { date: "desc" },
    });
  }

  async findById(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: { sppg: true, complaints: true },
    });

    if (!batch) {
      throw new NotFoundException("Batch tidak ditemukan");
    }

    return batch;
  }

  async findByNumber(batchNumber: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { batchNumber },
      include: { sppg: true },
    });

    if (!batch) {
      throw new NotFoundException("Batch tidak ditemukan");
    }

    // Return public data only
    return {
      batchNumber: batch.batchNumber,
      date: batch.date,
      sppg: batch.sppg.name,
      menu: batch.menu,
      nutrition: batch.nutrition,
      allergens: batch.allergens,
      costPerPortion: batch.costPerPortion,
      totalCost: batch.totalCost,
      status: batch.status,
    };
  }

  async create(sppgId: string, data: CreateBatchRequest) {
    const batchNumber = await this.generateBatchNumber();
    const reportKey = this.generateReportKey();

    return this.prisma.batch.create({
      data: {
        batchNumber,
        reportKey,
        menu: data.menu,
        nutrition: (data.nutrition as any) || undefined,
        allergens: data.allergens || [],
        costPerPortion: data.costPerPortion,
        totalCost: data.totalCost,
        sppgId,
      },
      include: { sppg: true },
    });
  }

  async getReportKey(batchId: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      select: { reportKey: true },
    });

    if (!batch) {
      throw new NotFoundException("Batch tidak ditemukan");
    }

    return batch.reportKey;
  }

  private async generateBatchNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    // Count existing batches today
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const count = await this.prisma.batch.count({
      where: {
        date: { gte: start, lte: end },
      },
    });

    const seq = String(count + 1).padStart(3, "0");
    return `BATCH-${dateStr}-${seq}`;
  }

  private generateReportKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = randomBytes(8);
    return Array.from(bytes)
      .map((byte) => chars[byte % chars.length])
      .join("");
  }
}
