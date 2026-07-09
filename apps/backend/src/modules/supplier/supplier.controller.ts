import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supplierService.findAll(search, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new supplier' })
  async create(@Body() body: any) {
    return this.supplierService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update supplier' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.supplierService.update(id, body);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'List supplier items' })
  async getItems(@Param('id') id: string) {
    return this.supplierService.getItems(id);
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to supplier' })
  async addItem(@Param('id') id: string, @Body() body: any) {
    return this.supplierService.addItem(id, body);
  }
}
