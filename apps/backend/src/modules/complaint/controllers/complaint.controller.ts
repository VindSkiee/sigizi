import { Controller, Get, Post, Put, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ComplaintService } from "../services/complaint.service";
import { ComplaintStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("Complaints")
@Controller("complaints")
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  @ApiOperation({ summary: "List complaints" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("batchId") batchId?: string,
    @Query("status") status?: ComplaintStatus,
  ) {
    return this.complaintService.findAll(pagination, batchId, status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get complaint by ID" })
  findOne(@Param("id") id: string) {
    return this.complaintService.findOne(id);
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
  @ApiOperation({ summary: "Update complaint status" })
  updateStatus(
    @Param("id") id: string,
    @Body("status") status: ComplaintStatus,
    @Body("notes") notes?: string,
  ) {
    return this.complaintService.updateStatus(id, status, notes);
  }
}
