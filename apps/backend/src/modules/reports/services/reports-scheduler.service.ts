import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Role } from "@sigizi/shared";
import { PrismaService } from "../../../database/prisma.service";
import { ReportsService } from "./reports.service";

@Injectable()
export class ReportsSchedulerService {
  private readonly logger = new Logger(ReportsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  @Cron("0 10 0 * * *", {
    timeZone: "Asia/Jakarta",
  })
  async generateDailyReports() {
    const range = this.getPreviousDayRange();
    await this.generateForAllSppgs("DAILY", range);
  }

  @Cron("0 15 0 * * 1", {
    timeZone: "Asia/Jakarta",
  })
  async generateWeeklyReports() {
    const range = this.getPreviousWeekRange();
    await this.generateForAllSppgs("WEEKLY", range);
  }

  @Cron("0 20 0 1 * *", {
    timeZone: "Asia/Jakarta",
  })
  async generateMonthlyReports() {
    const range = this.getPreviousMonthRange();
    await this.generateForAllSppgs("MONTHLY", range);
  }

  private async generateForAllSppgs(
    type: "DAILY" | "WEEKLY" | "MONTHLY",
    range: { startDate: Date; endDate: Date; periodKey: string },
  ) {
    const sppgs = await this.prisma.sppg.findMany({ select: { id: true, name: true } });

    for (const sppg of sppgs) {
      const admin = await this.prisma.user.findFirst({
        where: {
          sppgId: sppg.id,
          role: Role.SPPG_ADMIN,
        },
        select: { id: true },
      });

      if (!admin) {
        this.logger.warn(`Tidak ada admin untuk SPPG ${sppg.name}, laporan dilewati`);
        continue;
      }

      try {
        await this.reportsService.generateOfficialReport(sppg.id, type, range, admin.id);
        this.logger.log(`Laporan ${type} berhasil dibuat untuk ${sppg.name}`);
      } catch (error) {
        this.logger.error(
          `Gagal membuat laporan ${type} untuk ${sppg.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private getPreviousDayRange() {
    const endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - 0);
    const startDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() - 1, 0, 0, 0, 0));
    const periodKey = this.formatDate(startDate);
    return {
      startDate,
      endDate: new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 1, 0, 0, 0, 0)),
      periodKey,
    };
  }

  private getPreviousWeekRange() {
    const today = new Date();
    const thisWeekStart = this.getIsoWeekStart(today);
    const startDate = new Date(thisWeekStart);
    startDate.setUTCDate(startDate.getUTCDate() - 7);
    const endDate = new Date(thisWeekStart);
    const periodKey = this.formatIsoWeek(startDate);
    return { startDate, endDate, periodKey };
  }

  private getPreviousMonthRange() {
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const periodKey = `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, "0")}`;
    return { startDate, endDate, periodKey };
  }

  private getIsoWeekStart(date: Date) {
    const working = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const day = working.getUTCDay() || 7;
    working.setUTCDate(working.getUTCDate() - day + 1);
    return working;
  }

  private formatIsoWeek(date: Date) {
    const year = date.getUTCFullYear();
    const week = this.getIsoWeekNumber(date);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }

  private getIsoWeekNumber(date: Date) {
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNr = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const diff = target.getTime() - firstThursday.getTime();
    return 1 + Math.round(diff / 604800000);
  }

  private formatDate(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
      date.getUTCDate(),
    ).padStart(2, "0")}`;
  }
}