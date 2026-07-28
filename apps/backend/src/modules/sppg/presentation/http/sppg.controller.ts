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
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../../../../common";
import { Role } from "@sigizi/shared";
import { SppgService } from "../../application/services/sppg.service";
import { CreateSppgDto } from "../../application/dto/create-sppg.dto";
import { UpdateSppgDto } from "../../application/dto/update-sppg.dto";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

@ApiTags("SPPG")
@Controller("sppg")
export class SppgController {
  constructor(private readonly sppgService: SppgService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all SPPGs" })
  findAll(@Query() pagination: PaginationDto) {
    return this.sppgService.findAll(pagination);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get SPPG by ID" })
  findOne(@Param("id") id: string) {
    return this.sppgService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create SPPG" })
  create(@Body() dto: CreateSppgDto) {
    return this.sppgService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update SPPG" })
  update(@Param("id") id: string, @Body() dto: UpdateSppgDto) {
    return this.sppgService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete SPPG" })
  remove(@Param("id") id: string) {
    return this.sppgService.remove(id);
  }
}
