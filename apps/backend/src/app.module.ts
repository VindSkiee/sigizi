import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { SppgModule } from "./modules/sppg/sppg.module";
import { SupplierModule } from "./modules/supplier/supplier.module";
import { BeneficiaryModule } from "./modules/beneficiary/beneficiary.module";
import { MouModule } from "./modules/mou/mou.module";
import { OrderModule } from "./modules/order/order.module";
import { BatchModule } from "./modules/batch/batch.module";
import { ComplaintModule } from "./modules/complaint/complaint.module";
import { MarketModule } from "./modules/market/market.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { PrismaModule } from "./database/prisma.module";
import {
  LoggerModule,
  RequestIdMiddleware,
  RequestLoggerMiddleware,
} from "./common";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    // Rate limiting global: 100 req/menit (longgar, tidak menghalangi verifikasi publik)
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 },
    ]),
    LoggerModule,
    PrismaModule,
    AuthModule,
    SppgModule,
    SupplierModule,
    BeneficiaryModule,
    MouModule,
    OrderModule,
    BatchModule,
    ComplaintModule,
    MarketModule,
    ReportsModule,
    InventoryModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware to all routes
    consumer.apply(RequestIdMiddleware).forRoutes("*");

    // Apply RequestLoggerMiddleware to all routes
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
}
