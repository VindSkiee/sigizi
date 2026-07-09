import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get daily report' })
  async getDaily(@Request() req, @Query('date') date: string) {
    return this.reportsService.getDailyReport(req.user.sppgId, date);
  }

  @Get('weekly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weekly report' })
  async getWeekly(@Request() req, @Query('week') week: string) {
    return this.reportsService.getWeeklyReport(req.user.sppgId, week);
  }
}
