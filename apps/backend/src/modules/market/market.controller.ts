import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get market prices for an item' })
  async getPrices(
    @Query('item') item: string,
    @Query('region') region?: string,
  ) {
    return this.marketService.getMarketPrices(item, region);
  }

  @Get('anomalies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get price anomalies' })
  async getAnomalies(@Query('region') region?: string) {
    return this.marketService.getAnomalies(region);
  }

  @Get('het-suggestion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get HET suggestion' })
  async getHETSuggestion(
    @Query('item') item: string,
    @Query('region') region?: string,
  ) {
    return this.marketService.getHETSuggestion(item, region);
  }
}
