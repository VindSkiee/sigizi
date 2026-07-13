import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@sigizi/shared";
import { InventoryService } from "./inventory.service";
import {
  CreateManualStockDto,
  AdjustStockDto,
  StockQueryDto,
  LowStockAlertDto,
} from "./dto";
import { PaginationDto } from "../../core/dto/pagination.dto";

@ApiTags("Inventory")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // =========================================================================
  // MUTATION ENDPOINTS (SPPG_ADMIN only)
  // =========================================================================

  @Post("manual")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "Input stok manual (SPPG_ADMIN only)" })
  async createManualStock(
    @Body() dto: CreateManualStockDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.createManualStock(dto, user.sppgId, user.id);
  }

  @Patch(":id/adjust")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "Penyesuaian stok lot (SPPG_ADMIN only)" })
  async adjustStockLot(
    @Param("id") id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.adjustStockLot(id, dto, user.id);
  }

  // =========================================================================
  // QUERY ENDPOINTS (SPPG_ADMIN only)
  // =========================================================================

  @Get()
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "List semua lot stok (SPPG_ADMIN only)" })
  async findAll(
    @CurrentUser() user: any,
    @Query() pagination: PaginationDto,
    @Query() query: StockQueryDto,
  ) {
    return this.inventoryService.findAll(user.sppgId, pagination, query);
  }

  @Get("balance")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({
    summary: "Real-time balance stok per item (SPPG_ADMIN only)",
  })
  @ApiQuery({ name: "itemId", required: false })
  async getStockBalance(
    @CurrentUser() user: any,
    @Query("itemId") itemId?: string,
  ) {
    return this.inventoryService.getStockBalance(user.sppgId, itemId);
  }

  @Get("valuation")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "Nilai aset stok (SPPG_ADMIN only)" })
  async getStockValuation(@CurrentUser() user: any) {
    return this.inventoryService.getStockValuation(user.sppgId);
  }

  @Get("alerts")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "Low stock alerts (SPPG_ADMIN only)" })
  async getLowStockAlerts(
    @CurrentUser() user: any,
    @Query() query: LowStockAlertDto,
  ) {
    return this.inventoryService.getLowStockAlerts(
      user.sppgId,
      query.defaultThreshold,
    );
  }

  @Get(":id/history")
  @Roles(Role.SPPG_ADMIN)
  @ApiOperation({ summary: "Riwayat penyesuaian stok lot (SPPG_ADMIN only)" })
  async getStockAdjustmentHistory(@Param("id") id: string) {
    return this.inventoryService.getStockAdjustmentHistory(id);
  }
}
