import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(private batchService: BatchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List batches' })
  async findAll(
    @Request() req,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.batchService.findAll(req.user.sppgId, date, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get batch by ID' })
  async findById(@Param('id') id: string) {
    return this.batchService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new batch' })
  async create(@Request() req, @Body() body: any) {
    return this.batchService.create(req.user.sppgId, body);
  }
}

@ApiTags('Public')
@Controller('public')
export class PublicBatchController {
  constructor(private batchService: BatchService) {}

  @Get('batch/:batchNumber')
  @ApiOperation({ summary: 'Get batch by number (public)' })
  async findByNumber(@Param('batchNumber') batchNumber: string) {
    return this.batchService.findByNumber(batchNumber);
  }
}
