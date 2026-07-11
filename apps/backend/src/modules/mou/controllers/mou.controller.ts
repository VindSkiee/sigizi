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
import { MouService } from "../services/mou.service";
import { CreateMouDto } from "../dto/create-mou.dto";
import { MouStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("MoU")
@Controller("mou")
export class MouController {
  constructor(private readonly mouService: MouService) {}

  @Get()
  @ApiOperation({ summary: "List MoUs" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.mouService.findAll(pagination, sppgId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get MoU by ID" })
  findOne(@Param("id") id: string) {
    return this.mouService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create MoU" })
  create(@Body() dto: CreateMouDto, @Query("userId") userId: string) {
    return this.mouService.create(dto, userId);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update MoU status" })
  updateStatus(@Param("id") id: string, @Body("status") status: MouStatus) {
    return this.mouService.updateStatus(id, status);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete MoU (DRAFT only)" })
  remove(@Param("id") id: string) {
    return this.mouService.remove(id);
  }
}
