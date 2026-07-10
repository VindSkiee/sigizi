import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SppgService } from "../services/sppg.service";
import { CreateSppgDto } from "../dto/create-sppg.dto";
import { UpdateSppgDto } from "../dto/update-sppg.dto";
import { PaginationDto } from "../../../core/dto/pagination.dto";

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
  @ApiOperation({ summary: "Create SPPG" })
  create(@Body() dto: CreateSppgDto) {
    return this.sppgService.create(dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update SPPG" })
  update(@Param("id") id: string, @Body() dto: UpdateSppgDto) {
    return this.sppgService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete SPPG" })
  remove(@Param("id") id: string) {
    return this.sppgService.remove(id);
  }
}
