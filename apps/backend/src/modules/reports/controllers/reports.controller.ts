import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ReportsService } from "../services/reports.service";

@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("daily")
  @ApiOperation({ summary: "Get daily report" })
  getDailyReport(
    @Query("date") date: string,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.reportsService.getDailyReport(date, sppgId);
  }

  @Get("weekly")
  @ApiOperation({ summary: "Get weekly report (week format: YYYY-Wxx)" })
  getWeeklyReport(
    @Query("week") week: string,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.reportsService.getWeeklyReport(week, sppgId);
  }
}
