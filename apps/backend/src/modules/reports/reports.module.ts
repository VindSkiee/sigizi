import { Module } from "@nestjs/common";
import { ReportsService } from "./services/reports.service";
import { ReportsController } from "./controllers/reports.controller";
import { OperationalExpenseController } from "./controllers/operational-expense.controller";
import { PdfGeneratorService } from "./services/pdf-generator.service";
import { ReportsSchedulerService } from "./services/reports-scheduler.service";

@Module({
  controllers: [ReportsController, OperationalExpenseController],
  providers: [ReportsService, PdfGeneratorService, ReportsSchedulerService],
  exports: [ReportsService, PdfGeneratorService],
})
export class ReportsModule {}
