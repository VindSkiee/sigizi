import { Module } from "@nestjs/common";
import { MarketService } from "./services/market.service";
import { MarketController } from "./controllers/market.controller";

@Module({
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
