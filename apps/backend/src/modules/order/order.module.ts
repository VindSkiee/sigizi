import { Module } from "@nestjs/common";
import { OrderService } from "./services/order.service";
import { OrderController } from "./controllers/order.controller";
import { MarketModule } from "../market/market.module";

@Module({
  imports: [MarketModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
