import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { MarketService } from "../services/market.service";

@ApiTags("Market Analytics")
@Controller("market")
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get("prices")
  @ApiOperation({ summary: "Get market prices for an item" })
  getPrices(@Query("item") item: string, @Query("region") region?: string) {
    return this.marketService.getMarketPrices(item, region);
  }

  @Get("anomalies")
  @ApiOperation({ summary: "Get price anomalies (IQR-based)" })
  getAnomalies(@Query("region") region?: string) {
    return this.marketService.getAnomalies(region);
  }

  @Get("het-suggestion")
  @ApiOperation({ summary: "Get HET (Harga Eceran Tertinggi) suggestion" })
  getHETSuggestion(
    @Query("item") item: string,
    @Query("region") region?: string,
  ) {
    return this.marketService.getHETSuggestion(item, region);
  }
}
