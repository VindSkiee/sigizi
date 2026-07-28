import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BatchService } from "../services/batch.service";
import { CreateBatchDto } from "../dto/create-batch.dto";
import { UpdateBatchStatusDto } from "../dto/update-batch-status.dto";
import { BatchStatus, Role } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";

@ApiTags("Batches")
@Controller("batches")
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get batch by ID" })
  findOne(@Param("id") id: string) {
    return this.batchService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create batch" })
  create(@Body() dto: CreateBatchDto, @CurrentUser() user: any) {
    return this.batchService.create(dto, user.sppgId, user.id);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update batch status" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateBatchStatusDto) {
    return this.batchService.updateStatus(id, dto);
  }
}
