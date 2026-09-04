import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OrderService } from "../services/order.service";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  TransactionHistoryQueryDto,
} from "../dto";
import { OrderStatus, Role } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List orders" })
  findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: any,
    @Query("sppgId") sppgId?: string,
    @Query("supplierId") supplierId?: string,
    @Query("status") status?: OrderStatus,
  ) {
    return this.orderService.findAll(
      pagination,
      user,
      sppgId,
      supplierId,
      status,
    );
  }

  @Get("transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List transactions for SPPG (date range, paginated)",
  })
  findTransactions(
    @Query() query: TransactionHistoryQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.findTransactions(user.sppgId, query);
  }

  @Get("transactions/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get transaction detail by ID" })
  findTransactionDetail(@Param("id") id: string, @CurrentUser() user: any) {
    return this.orderService.findTransactionDetail(id, user.sppgId);
  }

  @Get("supplier-transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List transactions for Supplier (date range, paginated)",
  })
  findSupplierTransactions(
    @Query() query: TransactionHistoryQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.findSupplierTransactions(user.supplierId, query);
  }

  @Get("supplier-transactions/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get transaction detail by ID (Supplier)" })
  findSupplierTransactionDetail(
    @Param("id") id: string,
    @CurrentUser() user: any,
  ) {
    return this.orderService.findSupplierTransactionDetail(id, user.supplierId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get order by ID" })
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create order (SPPG_ADMIN only)" })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.orderService.create(dto, user.sppgId, user.id);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN, Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update order status" })
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.updateStatus(id, dto, user);
  }

  @Put(":id/payment")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm payment for order (SPPG_ADMIN only)" })
  confirmPayment(@Param("id") id: string, @CurrentUser() user: any) {
    return this.orderService.confirmPayment(id, user.id);
  }
}
