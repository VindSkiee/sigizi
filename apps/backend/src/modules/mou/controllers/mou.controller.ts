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
import { MouService } from "../services/mou.service";
import { CreateMouDto } from "../dto/create-mou.dto";
import { MouStatus, Role } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";

@ApiTags("MoU")
@Controller("mou")
export class MouController {
  constructor(private readonly mouService: MouService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List MoUs" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
  ) {
    return this.mouService.findAll(pagination, sppgId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get MoU by ID" })
  findOne(@Param("id") id: string) {
    return this.mouService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create MoU" })
  create(@Body() dto: CreateMouDto, @CurrentUser() user: any) {
    return this.mouService.create(dto, user.id);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update MoU status" })
  updateStatus(@Param("id") id: string, @Body("status") status: MouStatus) {
    return this.mouService.updateStatus(id, status);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete MoU (DRAFT only)" })
  remove(@Param("id") id: string) {
    return this.mouService.remove(id);
  }
}
