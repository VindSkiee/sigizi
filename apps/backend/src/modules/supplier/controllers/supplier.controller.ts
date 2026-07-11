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
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { SupplierService } from "../services/supplier.service";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";
import { CreateSupplierItemDto } from "../dto/create-supplier-item.dto";
import { PaginationDto } from "../../../core/dto/pagination.dto";

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

  @Put(":id")
  @ApiOperation({ summary: "Update supplier" })
  update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(":id")
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
  @ApiOperation({ summary: "Add supplier item" })
  addItem(@Param("id") id: string, @Body() dto: CreateSupplierItemDto) {
    return this.supplierService.addItem(id, dto);
  }

  @Delete("items/:itemId")
  @ApiOperation({ summary: "Remove supplier item" })
  removeItem(@Param("itemId") itemId: string) {
    return this.supplierService.removeItem(itemId);
  }
}
