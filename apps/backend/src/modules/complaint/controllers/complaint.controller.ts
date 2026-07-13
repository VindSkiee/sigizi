import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ComplaintService } from "../services/complaint.service";
import { ComplaintStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("Complaints")
@Controller("complaints")
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List complaints (filtered by SPPG)" })
  @ApiQuery({ name: "batchId", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "sppgId", required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("batchId") batchId?: string,
    @Query("status") status?: ComplaintStatus,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.complaintService.findAll(pagination, {
      batchId,
      status,
      sppgId,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get complaint by ID + auto-mark as REVIEWED" })
  findOne(@Param("id") id: string) {
    return this.complaintService.findOneAndMarkReviewed(id);
  }

  @Post()
  @ApiOperation({ summary: "Submit complaint (public, via reportKey)" })
  submit(
    @Body("reportKey") reportKey: string,
    @Body("description") description: string,
    @Body("evidence") evidence?: string,
  ) {
    return this.complaintService.submit(reportKey, description, evidence);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update complaint status (REVIEWED → RESOLVED with notes)",
  })
  updateStatus(
    @Param("id") id: string,
    @Body("status") status: ComplaintStatus,
    @Body("notes") notes?: string,
  ) {
    return this.complaintService.updateStatus(id, status, notes);
  }
}
