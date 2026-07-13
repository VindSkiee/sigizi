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
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { SupplierService } from "../../application/services/supplier.service";
import { CreateSupplierDto } from "../../application/dto/create-supplier.dto";
import { UpdateSupplierDto } from "../../application/dto/update-supplier.dto";
import { UpdateSupplierProfileDto } from "../../application/dto/update-supplier-profile.dto";
import { CreateSupplierItemDto } from "../../application/dto/create-supplier-item.dto";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

@ApiTags("Suppliers")
@Controller("suppliers")
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: "List all suppliers" })
  @ApiQuery({ name: "search", required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("search") search?: string,
  ) {
    return this.supplierService.findAll(pagination, search);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current supplier profile" })
  getProfile(@Request() req: any) {
    return this.supplierService.findOne(req.user.supplierId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get supplier by ID" })
  findOne(@Param("id") id: string) {
    return this.supplierService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Register supplier" })
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Put("me/profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update own profile" })
  updateProfile(@Request() req: any, @Body() dto: UpdateSupplierProfileDto) {
    return this.supplierService.updateProfile(req.user.supplierId, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update supplier" })
  update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete supplier" })
  remove(@Param("id") id: string) {
    return this.supplierService.remove(id);
  }

  @Get(":id/items")
  @ApiOperation({ summary: "List supplier items" })
  findItems(@Param("id") id: string) {
    return this.supplierService.findItems(id);
  }

  @Post(":id/items")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add supplier item" })
  addItem(@Param("id") id: string, @Body() dto: CreateSupplierItemDto) {
    return this.supplierService.addItem(id, dto);
  }

  @Delete("items/:itemId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove supplier item" })
  removeItem(@Param("itemId") itemId: string) {
    return this.supplierService.removeItem(itemId);
  }
}
