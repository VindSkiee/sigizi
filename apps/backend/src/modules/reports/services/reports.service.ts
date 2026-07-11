import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyReport(date: string, sppgId?: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const where: any = {
      date: { gte: startDate, lt: endDate },
    };
    if (sppgId) where.sppgId = sppgId;

    const batches = await this.prisma.batch.findMany({
      where,
      include: { batchItems: true, sppg: true, complaints: true },
    });

    const totalBatches = batches.length;
    const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);
    const totalPortions = batches.reduce(
      (sum, b) => sum + (b.beneficiaryCount ?? 0),
      0,
    );
    const avgCostPerPortion =
      totalPortions > 0 ? Math.round(totalCost / totalPortions) : 0;

    const complaints = batches.flatMap((b) => b.complaints);
    const pendingComplaints = complaints.filter(
      (c) => c.status === "PENDING",
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "RESOLVED",
    ).length;

    return {
      date,
      sppg: batches[0]?.sppg?.name ?? null,
      summary: {
        totalBatches,
        totalCost,
        totalPortions,
        avgCostPerPortion,
      },
      batches: batches.map((b) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        menu: b.menu,
        costPerPortion: b.costPerPortion,
        totalCost: b.totalCost,
        beneficiaryCount: b.beneficiaryCount,
        status: b.status,
      })),
      complaints: {
        total: complaints.length,
        pending: pendingComplaints,
        resolved: resolvedComplaints,
      },
    };
  }

  async getWeeklyReport(week: string, sppgId?: string) {
    const [year, weekNum] = week.split("-W").map(Number);
    const startDate = this.getWeekStartDate(year, weekNum);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const where: any = {
      date: { gte: startDate, lt: endDate },
    };
    if (sppgId) where.sppgId = sppgId;

    const batches = await this.prisma.batch.findMany({
      where,
      include: { batchItems: true, sppg: true, complaints: true },
    });

    const totalBatches = batches.length;
    const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);
    const totalPortions = batches.reduce(
      (sum, b) => sum + (b.beneficiaryCount ?? 0),
      0,
    );
    const avgCostPerPortion =
      totalPortions > 0 ? Math.round(totalCost / totalPortions) : 0;

    const complaints = batches.flatMap((b) => b.complaints);

    const dailyBreakdown = this.groupBatchesByDay(batches);

    return {
      week,
      sppg: batches[0]?.sppg?.name ?? null,
      summary: {
        totalBatches,
        totalCost,
        totalPortions,
        avgCostPerPortion,
      },
      complaints: {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "PENDING").length,
        resolved: complaints.filter((c) => c.status === "RESOLVED").length,
      },
      dailyBreakdown,
    };
  }

  private getWeekStartDate(year: number, week: number): Date {
    const jan1 = new Date(year, 0, 1);
    const dayOffset = jan1.getDay();
    const firstMonday = new Date(jan1);
    firstMonday.setDate(firstMonday.getDate() + ((8 - dayOffset) % 7 || 7));
    const weekStart = new Date(firstMonday);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
    return weekStart;
  }

  private groupBatchesByDay(batches: any[]) {
    const grouped: Record<string, any[]> = {};
    for (const batch of batches) {
      const day = batch.date.toISOString().slice(0, 10);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({
        id: batch.id,
        batchNumber: batch.batchNumber,
        menu: batch.menu,
        costPerPortion: batch.costPerPortion,
        totalCost: batch.totalCost,
      });
    }
    return grouped;
  }
}
