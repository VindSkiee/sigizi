import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@sigizi/shared";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from "../../../common";
import {
  CreateOperationalExpenseDto,
  ListOperationalExpenseQueryDto,
  UpdateOperationalExpenseDto,
} from "../dto";
import { ReportsService } from "../services/reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SPPG_ADMIN)
@Controller("reports/operational-expenses")
export class OperationalExpenseController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: "List operational expenses" })
  findAll(
    @Query() query: ListOperationalExpenseQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.listOperationalExpenses(query, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get operational expense by ID" })
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    return this.reportsService.findOperationalExpense(id, user);
  }

  @Post()
  @ApiOperation({ summary: "Create operational expense" })
  create(@Body() dto: CreateOperationalExpenseDto, @CurrentUser() user: any) {
    return this.reportsService.createOperationalExpense(dto, user);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update operational expense" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateOperationalExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.updateOperationalExpense(id, dto, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete operational expense" })
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.reportsService.deleteOperationalExpense(id, user);
  }
}