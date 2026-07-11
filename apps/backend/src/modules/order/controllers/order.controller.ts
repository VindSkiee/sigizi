import { Controller, Get, Post, Put, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OrderService } from "../services/order.service";
import { CreateOrderDto } from "../dto/create-order.dto";
import { OrderStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: "List orders" })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("sppgId") sppgId?: string,
    @Query("supplierId") supplierId?: string,
  ) {
    return this.orderService.findAll(pagination, sppgId, supplierId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create order" })
  create(
    @Body() dto: CreateOrderDto,
    @Query("sppgId") sppgId: string,
    @Query("userId") userId: string,
  ) {
    return this.orderService.create(dto, sppgId, userId);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update order status" })
  updateStatus(@Param("id") id: string, @Body("status") status: OrderStatus) {
    return this.orderService.updateStatus(id, status);
  }
}
