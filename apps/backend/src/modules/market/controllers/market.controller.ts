import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { MarketService } from "../services/market.service";
import { MarketPricesQueryDto } from "../dto/market-prices-query.dto";
import { MarketAnomaliesQueryDto } from "../dto/market-anomalies-query.dto";
import { ValidatePriceDto } from "../dto/validate-price.dto";

@ApiTags("Market Analytics")
@Controller("market")
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get("prices")
  @ApiOperation({ summary: "Get market prices for an item" })
  getPrices(@Query() query: MarketPricesQueryDto) {
    const { item, ...filter } = query;
    return this.marketService.getMarketPrices(item, filter);
  }

  @Get("anomalies")
  @ApiOperation({ summary: "Get price anomalies (IQR-based)" })
  getAnomalies(@Query() query: MarketAnomaliesQueryDto) {
    return this.marketService.getAnomalies(query);
  }

  @Get("het-suggestion")
  @ApiOperation({ summary: "Get HET (Harga Eceran Tertinggi) suggestion" })
  getHETSuggestion(@Query() query: MarketPricesQueryDto) {
    const { item, ...filter } = query;
    return this.marketService.getHETSuggestion(item, filter);
  }

  @Post("validate-price")
  @ApiOperation({ summary: "Validate supplier price against market data" })
  async validatePrice(@Body() dto: ValidatePriceDto) {
    const filter = {
      province: dto.province,
      regency: dto.regency,
      district: dto.district,
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
    const result = await this.marketService.validatePrice(
      dto.itemName,
      dto.proposedPrice,
      filter,
    );
    return {
      itemName: dto.itemName,
      proposedPrice: dto.proposedPrice,
      validation: result,
    };
  }
}
