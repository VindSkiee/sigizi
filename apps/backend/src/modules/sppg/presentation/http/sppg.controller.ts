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
import { SppgService } from "../../application/services/sppg.service";
import { CreateSppgDto } from "../../application/dto/create-sppg.dto";
import { UpdateSppgDto } from "../../application/dto/update-sppg.dto";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

@ApiTags("SPPG")
@Controller("sppg")
export class SppgController {
  constructor(private readonly sppgService: SppgService) {}

  @Get()
  @ApiOperation({ summary: "List all SPPGs" })
  findAll(@Query() pagination: PaginationDto) {
    return this.sppgService.findAll(pagination);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get SPPG by ID" })
  findOne(@Param("id") id: string) {
    return this.sppgService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create SPPG" })
  create(@Body() dto: CreateSppgDto) {
    return this.sppgService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update SPPG" })
  update(@Param("id") id: string, @Body() dto: UpdateSppgDto) {
    return this.sppgService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete SPPG" })
  remove(@Param("id") id: string) {
    return this.sppgService.remove(id);
  }
}
