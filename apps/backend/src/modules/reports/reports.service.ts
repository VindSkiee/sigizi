import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyReport(sppgId: string, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [sppg, batches, complaints] = await Promise.all([
      this.prisma.sppg.findUnique({ where: { id: sppgId } }),
      this.prisma.batch.findMany({
        where: {
          sppgId,
          date: { gte: start, lte: end },
        },
        include: { complaints: true },
      }),
      this.prisma.complaint.findMany({
        where: {
          batch: { sppgId },
          batch: { date: { gte: start, lte: end } },
        },
      }),
    ]);

    if (!sppg) {
      throw new NotFoundException('SPPG tidak ditemukan');
    }

    const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);
    const totalPortions = batches.reduce(
      (sum, b) => sum + Math.round(b.totalCost / b.costPerPortion),
      0,
    );

    return {
      date,
      sppg: sppg.name,
      summary: {
        totalBatches: batches.length,
        totalCost,
        totalPortions,
        avgCostPerPortion: totalPortions > 0 ? totalCost / totalPortions : 0,
      },
      batches,
      complaints: {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === 'PENDING').length,
        resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
      },
    };
  }

  async getWeeklyReport(sppgId: string, week: string) {
    // Parse week string (e.g., "2026-W28")
    const [year, weekNum] = week.split('-W').map(Number);

    // Calculate date range for the week
    const startOfYear = new Date(year, 0, 1);
    const startOfWeek = new Date(startOfYear);
    startOfWeek.setDate(startOfWeek.getDate() + (weekNum - 1) * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [sppg, batches] = await Promise.all([
      this.prisma.sppg.findUnique({ where: { id: sppgId } }),
      this.prisma.batch.findMany({
        where: {
          sppgId,
          date: { gte: startOfWeek, lte: endOfWeek },
        },
        include: { complaints: true },
      }),
    ]);

    if (!sppg) {
      throw new NotFoundException('SPPG tidak ditemukan');
    }

    const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);
    const totalPortions = batches.reduce(
      (sum, b) => sum + Math.round(b.totalCost / b.costPerPortion),
      0,
    );

    // Group by date
    const dailyReports = batches.reduce((acc, batch) => {
      const dateKey = batch.date.toISOString().slice(0, 10);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(batch);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      week,
      sppg: sppg.name,
      summary: {
        totalBatches: batches.length,
        totalCost,
        totalPortions,
        avgCostPerPortion: totalPortions > 0 ? totalCost / totalPortions : 0,
      },
      dailyReports: Object.entries(dailyReports).map(([date, dayBatches]) => ({
        date,
        batches: dayBatches,
        totalCost: dayBatches.reduce((sum, b) => sum + b.totalCost, 0),
      })),
    };
  }
}
