import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { createReadStream } from "fs";
import { existsSync } from "fs";
import { Response } from "express";
import { Role } from "@sigizi/shared";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";
import { ExpenseBreakdownQueryDto } from "../dto";
import { ReportsService } from "../services/reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SPPG_ADMIN)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("daily")
  @ApiOperation({ summary: "Get daily official report" })
  getDailyReport(@Query("date") date: string, @CurrentUser() user: any) {
    return this.reportsService.getDailyReport(date, user);
  }

  @Get("weekly")
  @ApiOperation({ summary: "Get weekly official report" })
  getWeeklyReport(@Query("week") week: string, @CurrentUser() user: any) {
    return this.reportsService.getWeeklyReport(week, user);
  }

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly official report" })
  getMonthlyReport(@Query("month") month: string, @CurrentUser() user: any) {
    return this.reportsService.getMonthlyReport(month, user);
  }

  @Get("expenses")
  @ApiOperation({ summary: "Get granular expense breakdown" })
  getExpenseBreakdown(
    @Query() query: ExpenseBreakdownQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.getExpenseBreakdown(query, user);
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Download official report PDF" })
  async downloadReport(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.getReportSnapshotForDownload(
      id,
      user,
    );

    if (!report.pdfPath || !existsSync(report.pdfPath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "File PDF laporan tidak ditemukan",
        },
      });
    }

    const fileName = `${report.type.toLowerCase()}-${report.periodKey}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const stream = createReadStream(report.pdfPath);
    stream.pipe(res);
  }
}