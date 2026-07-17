import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ReportSnapshot, ReportType as PrismaReportType } from "@prisma/client";
import { Role, OrderStatus } from "@sigizi/shared";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { PdfGeneratorService } from "./pdf-generator.service";
import {
  CreateOperationalExpenseDto,
  ExpenseBreakdownQueryDto,
  ListOperationalExpenseQueryDto,
  UpdateOperationalExpenseDto,
} from "../dto";
import {
  EXPENSE_SOURCE,
  ExpenseSource,
  FinancialLogEntry,
  OfficialReportPayload,
  ReportDateRange,
  ReportPeriodType,
} from "../reports.types";

type CurrentUserContext = {
  id: string;
  role: Role;
  sppgId?: string | null;
};

type AggregatedFinancialSections = {
  sppgName: string | null;
  cogs: FinancialLogEntry[];
  procurement: FinancialLogEntry[];
  opex: FinancialLogEntry[];
  totalCogs: number;
  totalProcured: number;
  totalOpex: number;
  totalPortions: number;
  totalWarningBypassCount: number;
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async getDailyReport(date: string, user: CurrentUserContext) {
    const range = this.buildDailyRange(date);
    return this.generateOfficialReport(user.sppgId, "DAILY", range, user.id);
  }

  async getWeeklyReport(week: string, user: CurrentUserContext) {
    const range = this.buildWeeklyRange(week);
    return this.generateOfficialReport(user.sppgId, "WEEKLY", range, user.id);
  }

  async getMonthlyReport(month: string, user: CurrentUserContext) {
    const range = this.buildMonthlyRange(month);
    return this.generateOfficialReport(user.sppgId, "MONTHLY", range, user.id);
  }

  async getExpenseBreakdown(
    query: ExpenseBreakdownQueryDto,
    user: CurrentUserContext,
  ) {
    this.assertUserHasSppg(user);

    const range = this.buildCustomRange(query.startDate, query.endDate);
    const sections = await this.loadFinancialSections(user.sppgId!, range);

    const source = query.source ?? EXPENSE_SOURCE.ALL;
    const items = this.selectExpenseItemsBySource(source, sections);

    return {
      source,
      sppgId: user.sppgId,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      items,
      summary: {
        totalCogs: sections.totalCogs,
        totalProcured: sections.totalProcured,
        totalOpex: sections.totalOpex,
        grandTotal:
          sections.totalCogs + sections.totalProcured + sections.totalOpex,
      },
    };
  }

  async generateOfficialReport(
    sppgId: string | null | undefined,
    type: ReportPeriodType,
    dateRange: ReportDateRange,
    userId: string,
  ): Promise<OfficialReportPayload> {
    this.assertSppgId(sppgId);

    const snapshot = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.reportSnapshot.findFirst({
        where: {
          sppgId,
          type: type as PrismaReportType,
          periodKey: dateRange.periodKey,
        },
        include: { sppg: { select: { name: true } } },
      });

      if (existing) {
        return existing;
      }

      const sections = await this.loadFinancialSections(sppgId, dateRange, tx);

      const report = this.composeOfficialReportPayload({
        sppgId,
        sppgName: sections.sppgName,
        type,
        periodKey: dateRange.periodKey,
        dateRange,
        sections,
      });

      const created = await tx.reportSnapshot.create({
        data: {
          sppgId,
          type: type as PrismaReportType,
          periodKey: dateRange.periodKey,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          status: "FINAL",
          totalPortions: sections.totalPortions,
          totalCogs: sections.totalCogs,
          totalProcured: sections.totalProcured,
          totalOpex: sections.totalOpex,
          budgetVariance: report.totals.budgetVariance,
          warningBypassCount: sections.totalWarningBypassCount,
          generatedById: userId,
          finalizedAt: new Date(),
          payload: report as any,
        },
        include: { sppg: { select: { name: true } } },
      });

      return created;
    });

    const payload = this.normalizeSnapshotPayload(snapshot);

    if (!payload.pdfPath || !payload.pdfHash) {
      return this.ensurePdfGenerated(snapshot, payload);
    }

    return payload;
  }

  async listOperationalExpenses(
    query: ListOperationalExpenseQueryDto,
    user: CurrentUserContext,
  ): Promise<PaginatedResult<any>> {
    this.assertUserHasSppg(user);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { sppgId: user.sppgId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.startDate || query.endDate) {
      where.expenseDate = {};
      if (query.startDate) {
        where.expenseDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);
        where.expenseDate.lt = endDate;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.operationalExpense.findMany({
        where,
        skip: query.skip,
        take: limit,
        orderBy: { expenseDate: "desc" },
        include: {
          sppg: true,
          createdBy: { select: { id: true, name: true, email: true } },
          updatedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.operationalExpense.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOperationalExpense(id: string, user: CurrentUserContext) {
    this.assertUserHasSppg(user);

    const expense = await this.prisma.operationalExpense.findFirst({
      where: { id, sppgId: user.sppgId! },
      include: {
        sppg: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!expense) {
      throw new NotFoundException(
        `Pengeluaran operasional dengan ID ${id} tidak ditemukan`,
      );
    }

    return expense;
  }

  async createOperationalExpense(
    dto: CreateOperationalExpenseDto,
    user: CurrentUserContext,
  ) {
    this.assertUserHasSppg(user);

    return this.prisma.operationalExpense.create({
      data: {
        sppgId: user.sppgId!,
        category: dto.category,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        description: dto.description,
        evidenceUrl: dto.evidenceUrl,
        notes: dto.notes,
        createdById: user.id,
      },
    });
  }

  async updateOperationalExpense(
    id: string,
    dto: UpdateOperationalExpenseDto,
    user: CurrentUserContext,
  ) {
    const expense = await this.findOperationalExpense(id, user);

    return this.prisma.operationalExpense.update({
      where: { id: expense.id },
      data: {
        category: dto.category ?? expense.category,
        amount: dto.amount ?? expense.amount,
        expenseDate: dto.expenseDate
          ? new Date(dto.expenseDate)
          : expense.expenseDate,
        description: dto.description ?? expense.description,
        evidenceUrl: dto.evidenceUrl ?? expense.evidenceUrl,
        notes: dto.notes ?? expense.notes,
        updatedById: user.id,
      },
    });
  }

  async deleteOperationalExpense(id: string, user: CurrentUserContext) {
    const expense = await this.findOperationalExpense(id, user);

    await this.prisma.operationalExpense.delete({
      where: { id: expense.id },
    });

    return { success: true };
  }

  async getReportSnapshotForDownload(id: string, user: CurrentUserContext) {
    this.assertUserHasSppg(user);

    const snapshot = await this.prisma.reportSnapshot.findFirst({
      where: { id, sppgId: user.sppgId! },
      include: { sppg: { select: { name: true } } },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Snapshot laporan dengan ID ${id} tidak ditemukan`,
      );
    }

    const payload = this.normalizeSnapshotPayload(snapshot);
    if (!payload.pdfPath || !payload.pdfHash) {
      return this.ensurePdfGenerated(snapshot, payload);
    }

    return payload;
  }

  private async ensurePdfGenerated(
    snapshot: ReportSnapshot & { sppg?: { name: string | null } | null },
    payload?: OfficialReportPayload,
  ): Promise<OfficialReportPayload> {
    const reportPayload = payload ?? this.normalizeSnapshotPayload(snapshot);
    if (!reportPayload) {
      throw new BadRequestException("Payload laporan tidak tersedia untuk PDF");
    }

    const pdfPath = this.resolvePdfPath(
      reportPayload.sppgId,
      reportPayload.type,
      reportPayload.periodKey,
    );

    const result = await this.pdfGenerator.generateReportPdf(
      reportPayload,
      pdfPath,
    );

    const updated = await this.prisma.reportSnapshot.update({
      where: { id: snapshot.id },
      data: {
        pdfPath: result.pdfPath,
        pdfHash: result.pdfHash,
        payload: {
          ...reportPayload,
          pdfPath: result.pdfPath,
          pdfHash: result.pdfHash,
        } as any,
      },
      include: { sppg: { select: { name: true } } },
    });

    return this.normalizeSnapshotPayload(updated);
  }

  private normalizeSnapshotPayload(
    snapshot: ReportSnapshot & { sppg?: { name?: string | null } | null },
  ): OfficialReportPayload {
    const payload = snapshot.payload as OfficialReportPayload | null;
    const fallback = this.composeOfficialReportPayload({
      sppgId: snapshot.sppgId,
      sppgName: snapshot.sppg?.name ?? null,
      type: snapshot.type as ReportPeriodType,
      periodKey: snapshot.periodKey,
      dateRange: {
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        periodKey: snapshot.periodKey,
      },
      sections: {
        sppgName: snapshot.sppg?.name ?? null,
        cogs: [],
        procurement: [],
        opex: [],
        totalCogs: snapshot.totalCogs,
        totalProcured: snapshot.totalProcured,
        totalOpex: snapshot.totalOpex,
        totalPortions: snapshot.totalPortions,
        totalWarningBypassCount: snapshot.warningBypassCount ?? 0,
      },
    });

    return {
      ...fallback,
      ...(payload ?? {}),
      id: snapshot.id,
      sppgId: snapshot.sppgId,
      sppgName: snapshot.sppg?.name ?? payload?.sppgName ?? null,
      type:
        (snapshot.type as ReportPeriodType) ?? payload?.type ?? fallback.type,
      periodKey: snapshot.periodKey,
      startDate: snapshot.startDate.toISOString(),
      endDate: snapshot.endDate.toISOString(),
      status: snapshot.status,
      totals: {
        totalPortions: snapshot.totalPortions,
        totalCogs: snapshot.totalCogs,
        totalProcured: snapshot.totalProcured,
        totalOpex: snapshot.totalOpex,
        budgetVariance: snapshot.budgetVariance,
        warningBypassCount: snapshot.warningBypassCount ?? 0,
      },
      pdfPath: snapshot.pdfPath ?? payload?.pdfPath ?? null,
      pdfHash: snapshot.pdfHash ?? payload?.pdfHash ?? null,
      generatedAt: snapshot.generatedAt.toISOString(),
      finalizedAt: snapshot.finalizedAt.toISOString(),
    };
  }

  private composeOfficialReportPayload(params: {
    sppgId: string;
    sppgName: string | null;
    type: ReportPeriodType;
    periodKey: string;
    dateRange: ReportDateRange;
    sections: AggregatedFinancialSections;
  }): OfficialReportPayload {
    const budgetVariance =
      params.sections.totalPortions * 10000 - params.sections.totalCogs;

    return {
      id: "",
      sppgId: params.sppgId,
      sppgName: params.sppgName,
      type: params.type,
      periodKey: params.periodKey,
      startDate: params.dateRange.startDate.toISOString(),
      endDate: params.dateRange.endDate.toISOString(),
      status: "FINAL",
      totals: {
        totalPortions: params.sections.totalPortions,
        totalCogs: params.sections.totalCogs,
        totalProcured: params.sections.totalProcured,
        totalOpex: params.sections.totalOpex,
        budgetVariance,
        warningBypassCount: params.sections.totalWarningBypassCount,
      },
      breakdown: {
        cogs: {
          total: params.sections.totalCogs,
          items: params.sections.cogs,
        },
        procurement: {
          total: params.sections.totalProcured,
          items: params.sections.procurement,
        },
        opex: {
          total: params.sections.totalOpex,
          items: params.sections.opex,
        },
      },
      generatedAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
    };
  }

  private async loadFinancialSections(
    sppgId: string,
    range: ReportDateRange,
    tx: any = this.prisma,
  ): Promise<AggregatedFinancialSections> {
    const [sppg, batches, orders, expenses] = await Promise.all([
      tx.sppg.findUnique({
        where: { id: sppgId },
        select: { name: true },
      }),
      tx.batch.findMany({
        where: {
          sppgId,
          date: { gte: range.startDate, lt: range.endDate },
        },
        select: {
          id: true,
          batchNumber: true,
          date: true,
          menu: true,
          beneficiaryCount: true,
          batchItems: {
            select: {
              id: true,
              quantity: true,
              subtotal: true,
              name: true,
              unit: true,
              item: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "asc" },
      }),
      tx.order.findMany({
        where: {
          sppgId,
          paidAt: { not: null, gte: range.startDate, lt: range.endDate },
          status: { not: OrderStatus.CANCELLED },
        },
        select: {
          id: true,
          total: true,
          paidAt: true,
          updatedAt: true,
          supplier: { select: { name: true } },
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
              marketMedianAtPurchase: true,
              isWarningBypass: true,
              justificationNote: true,
              item: { select: { name: true, unit: true } },
            },
          },
        },
        orderBy: { paidAt: "asc" },
      }),
      tx.operationalExpense.findMany({
        where: {
          sppgId,
          expenseDate: { gte: range.startDate, lt: range.endDate },
        },
        select: {
          id: true,
          amount: true,
          expenseDate: true,
          category: true,
          description: true,
        },
        orderBy: { expenseDate: "asc" },
      }),
    ]);

    const cogs: FinancialLogEntry[] = batches.flatMap((batch) =>
      batch.batchItems.map((item) => ({
        source: "COGS",
        date: batch.date.toISOString(),
        referenceId: item.id,
        title: item.name ?? item.item?.name ?? batch.menu,
        description: `Batch ${batch.batchNumber}`,
        amount: item.subtotal,
        meta: {
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantity: item.quantity,
          unit: item.unit,
          beneficiaryCount: batch.beneficiaryCount ?? 0,
        },
      })),
    );

    const procurement: FinancialLogEntry[] = orders.map((order) => {
      const warningBypassItems = order.items.filter((i) => i.isWarningBypass);
      return {
        source: "PROCUREMENT",
        date: (order.paidAt ?? order.updatedAt).toISOString(),
        referenceId: order.id,
        title: order.supplier.name,
        description: "Pembayaran Pesanan",
        amount: order.total,
        meta: {
          orderId: order.id,
          orderItems: order.items.map((item) => ({
            itemName: item.item.name,
            unit: item.item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          warningBypassCount: warningBypassItems.length,
          priceValidation:
            warningBypassItems.length > 0
              ? {
                  hasWarningBypass: true,
                  bypassedItems: warningBypassItems.map((i) => ({
                    itemName: i.item.name,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    marketMedianAtPurchase: i.marketMedianAtPurchase,
                    justificationNote: i.justificationNote,
                  })),
                }
              : null,
        },
      };
    });

    const opex: FinancialLogEntry[] = expenses.map((expense) => ({
      source: "OPEX",
      date: expense.expenseDate.toISOString(),
      referenceId: expense.id,
      title: expense.category,
      description: expense.description,
      amount: expense.amount,
      meta: {
        category: expense.category,
      },
    }));

    const totalCogs = cogs.reduce((sum, item) => sum + item.amount, 0);
    const totalProcured = procurement.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const totalOpex = opex.reduce((sum, item) => sum + item.amount, 0);
    const totalPortions = batches.reduce(
      (sum, batch) => sum + (batch.beneficiaryCount ?? 0),
      0,
    );
    const totalWarningBypassCount = procurement.reduce(
      (sum, item) => sum + ((item.meta?.warningBypassCount as number) ?? 0),
      0,
    );

    return {
      sppgName: sppg?.name ?? null,
      cogs,
      procurement,
      opex,
      totalCogs,
      totalProcured,
      totalOpex,
      totalPortions,
      totalWarningBypassCount,
    };
  }

  private selectExpenseItemsBySource(
    source: ExpenseSource,
    sections: AggregatedFinancialSections,
  ) {
    if (source === EXPENSE_SOURCE.COGS) return sections.cogs;
    if (source === EXPENSE_SOURCE.PROCUREMENT) return sections.procurement;
    if (source === EXPENSE_SOURCE.OPEX) return sections.opex;

    return [...sections.cogs, ...sections.procurement, ...sections.opex].sort(
      (left, right) => left.date.localeCompare(right.date),
    );
  }

  private resolvePdfPath(
    sppgId: string,
    type: ReportPeriodType,
    periodKey: string,
  ) {
    const safePeriod = periodKey.replace(/[^0-9A-Za-z_-]/g, "_");
    return `storage/reports/${sppgId}/${type.toLowerCase()}/${safePeriod}.pdf`;
  }

  private buildDailyRange(date: string): ReportDateRange {
    const startDate = this.parseDateOnly(date);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    return {
      startDate,
      endDate,
      periodKey: date,
    };
  }

  private buildWeeklyRange(week: string): ReportDateRange {
    const match = week.match(/^(\d{4})-W(\d{2})$/);
    if (!match) {
      throw new BadRequestException("Format minggu harus YYYY-Wxx");
    }

    const year = Number(match[1]);
    const weekNumber = Number(match[2]);
    const startDate = this.getIsoWeekStartDate(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7);

    return {
      startDate,
      endDate,
      periodKey: week,
    };
  }

  private buildMonthlyRange(month: string): ReportDateRange {
    const match = month.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException("Format bulan harus YYYY-MM");
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));

    return {
      startDate,
      endDate,
      periodKey: month,
    };
  }

  private buildCustomRange(
    startDate: string,
    endDate: string,
  ): ReportDateRange {
    const start = this.parseDateOnly(startDate);
    const end = this.parseDateOnly(endDate);

    if (end < start) {
      throw new BadRequestException(
        "endDate tidak boleh lebih kecil dari startDate",
      );
    }

    const rangeEnd = new Date(end);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    return {
      startDate: start,
      endDate: rangeEnd,
      periodKey: `${startDate}_${endDate}`,
    };
  }

  private parseDateOnly(date: string) {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Tanggal tidak valid: ${date}`);
    }
    return parsed;
  }

  private getIsoWeekStartDate(year: number, week: number): Date {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const day = jan4.getUTCDay() || 7;
    const mondayWeek1 = new Date(jan4);
    mondayWeek1.setUTCDate(jan4.getUTCDate() - day + 1);

    const target = new Date(mondayWeek1);
    target.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
    return target;
  }

  private assertUserHasSppg(user: CurrentUserContext) {
    this.assertSppgId(user.sppgId);
  }

  private assertSppgId(
    sppgId: string | null | undefined,
  ): asserts sppgId is string {
    if (!sppgId) {
      throw new BadRequestException("User tidak memiliki relasi SPPG");
    }
  }
}
