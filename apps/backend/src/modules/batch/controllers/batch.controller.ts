import { Controller, Get, Post, Put, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BatchService } from "../services/batch.service";
import { CreateBatchDto } from "../dto/create-batch.dto";
import { UpdateBatchStatusDto } from "../dto/update-batch-status.dto";
import { BatchStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("Batches")
@Controller("batches")
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  @ApiOperation({ summary: "List batches" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
    @Query("status") status?: BatchStatus,
  ) {
    return this.batchService.findAll(pagination, sppgId, status);
  }

  @Get("by-number/:batchNumber")
  @ApiOperation({ summary: "Get batch by batch number (public)" })
  findByBatchNumber(@Param("batchNumber") batchNumber: string) {
    return this.batchService.findByBatchNumber(batchNumber);
  }

  @Get("by-report-key/:reportKey")
  @ApiOperation({ summary: "Get batch by report key (public)" })
  findByReportKey(@Param("reportKey") reportKey: string) {
    return this.batchService.findByReportKey(reportKey);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get batch by ID" })
  findOne(@Param("id") id: string) {
    return this.batchService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create batch" })
  create(
    @Body() dto: CreateBatchDto,
    @Query("sppgId") sppgId: string,
    @Query("userId") userId: string,
  ) {
    return this.batchService.create(dto, sppgId, userId);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update batch status" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateBatchStatusDto) {
    return this.batchService.updateStatus(id, dto);
  }
}
