import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard, Roles, CurrentUser } from "../../../../common";
import { Role } from "@sigizi/shared";
import { BeneficiaryService } from "../../application/services/beneficiary.service";
import { CreateBeneficiaryDto } from "../../application/dto/create-beneficiary.dto";
import { UpdateBeneficiaryDto } from "../../application/dto/update-beneficiary.dto";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

@ApiTags("Beneficiaries")
@Controller("beneficiaries")
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List beneficiaries" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "sppgId", required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
    @Query("search") search?: string,
  ) {
    return this.beneficiaryService.findAll(pagination, sppgId, search);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get beneficiary by ID" })
  findOne(@Param("id") id: string) {
    return this.beneficiaryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create beneficiary" })
  create(@Body() dto: CreateBeneficiaryDto, @CurrentUser() user: any) {
    return this.beneficiaryService.create(dto, user.sppgId);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update beneficiary" })
  update(@Param("id") id: string, @Body() dto: UpdateBeneficiaryDto) {
    return this.beneficiaryService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete beneficiary" })
  remove(@Param("id") id: string) {
    return this.beneficiaryService.remove(id);
  }
}
