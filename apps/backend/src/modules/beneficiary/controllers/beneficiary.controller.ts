import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { BeneficiaryService } from "../services/beneficiary.service";
import { CreateBeneficiaryDto } from "../dto/create-beneficiary.dto";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("Beneficiaries")
@Controller("beneficiaries")
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Get()
  @ApiOperation({ summary: "List beneficiaries" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.beneficiaryService.findAll(pagination, sppgId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get beneficiary by ID" })
  findOne(@Param("id") id: string) {
    return this.beneficiaryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create beneficiary" })
  create(@Body() dto: CreateBeneficiaryDto, @Query("sppgId") sppgId: string) {
    return this.beneficiaryService.create(dto, sppgId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete beneficiary" })
  remove(@Param("id") id: string) {
    return this.beneficiaryService.remove(id);
  }
}
