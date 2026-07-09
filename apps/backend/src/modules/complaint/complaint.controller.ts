import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintService } from './complaint.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List complaints' })
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('batchId') batchId?: string,
  ) {
    return this.complaintService.findAll(req.user.sppgId, status, batchId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit complaint' })
  async create(@Body() body: any) {
    return this.complaintService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update complaint status' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.complaintService.update(id, body);
  }
}
